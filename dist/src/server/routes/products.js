"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../validators/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const slug_1 = require("../services/slug");
exports.productRouter = (0, express_1.Router)();
exports.productRouter.use(auth_1.requireAuth);
async function existingProductSlugs(menuId, excludeId) {
    const prods = await prisma_1.prisma.product.findMany({
        where: { menuId, ...(excludeId ? { id: { not: excludeId } } : {}) },
        select: { slug: true },
    });
    return prods.map((p) => p.slug);
}
// ─── Multer config ────────────────────────────────────────────────────────────
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
// Helper: get current user's menu
async function getUserMenu(userId) {
    const menu = await prisma_1.prisma.menu.findUnique({ where: { userId } });
    if (!menu)
        throw (0, errorHandler_1.createError)('No menu found. Please create a menu first.', 404);
    return menu;
}
// GET /api/products
exports.productRouter.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await getUserMenu(req.user.id);
    const categoryId = req.query.categoryId;
    const products = await prisma_1.prisma.product.findMany({
        where: { menuId: menu.id, ...(categoryId ? { categoryId } : {}) },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
    });
    res.json({ products });
}));
// POST /api/products
exports.productRouter.post('/', upload.single('image'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        // clean up uploaded file if validation fails
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const menu = await getUserMenu(req.user.id);
    // Verify category belongs to this menu
    const category = await prisma_1.prisma.category.findFirst({
        where: { id: parsed.data.categoryId, menuId: menu.id },
    });
    if (!category) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        throw (0, errorHandler_1.createError)('Category not found', 404);
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = await (0, slug_1.uniqueSlug)(parsed.data.name, () => existingProductSlugs(menu.id));
    const product = await prisma_1.prisma.product.create({
        data: {
            name: parsed.data.name,
            slug,
            description: parsed.data.description ?? '',
            price: parsed.data.price,
            categoryId: parsed.data.categoryId,
            menuId: menu.id,
            imageUrl,
        },
        include: { category: true },
    });
    res.status(201).json({ product });
}));
// PATCH /api/products/:id
exports.productRouter.patch('/:id', upload.single('image'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const menu = await getUserMenu(req.user.id);
    const existing = await prisma_1.prisma.product.findFirst({
        where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing) {
        if (req.file)
            fs_1.default.unlinkSync(req.file.path);
        throw (0, errorHandler_1.createError)('Product not found', 404);
    }
    // If new image uploaded, delete old one
    let imageUrl = existing.imageUrl;
    if (req.file) {
        if (existing.imageUrl) {
            const oldPath = path_1.default.join(process.cwd(), existing.imageUrl);
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
        imageUrl = `/uploads/${req.file.filename}`;
    }
    const data = { imageUrl };
    if (parsed.data.name) {
        data.name = parsed.data.name;
        // Regenerate slug if name changed
        if (parsed.data.name !== existing.name) {
            data.slug = await (0, slug_1.uniqueSlug)(parsed.data.name, () => existingProductSlugs(menu.id, existing.id));
        }
    }
    if (parsed.data.description !== undefined)
        data.description = parsed.data.description;
    if (parsed.data.price)
        data.price = parsed.data.price;
    if (parsed.data.categoryId) {
        // Verify category
        const cat = await prisma_1.prisma.category.findFirst({
            where: { id: parsed.data.categoryId, menuId: menu.id },
        });
        if (!cat)
            throw (0, errorHandler_1.createError)('Category not found', 404);
        data.categoryId = parsed.data.categoryId;
    }
    const product = await prisma_1.prisma.product.update({
        where: { id: req.params.id },
        data,
        include: { category: true },
    });
    res.json({ product });
}));
// DELETE /api/products/:id
exports.productRouter.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await getUserMenu(req.user.id);
    const existing = await prisma_1.prisma.product.findFirst({
        where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing)
        throw (0, errorHandler_1.createError)('Product not found', 404);
    // Delete image file
    if (existing.imageUrl) {
        const imgPath = path_1.default.join(process.cwd(), existing.imageUrl);
        if (fs_1.default.existsSync(imgPath))
            fs_1.default.unlinkSync(imgPath);
    }
    await prisma_1.prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
}));
//# sourceMappingURL=products.js.map