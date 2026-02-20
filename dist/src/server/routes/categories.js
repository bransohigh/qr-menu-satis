"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../validators/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const slug_1 = require("../services/slug");
exports.categoryRouter = (0, express_1.Router)();
exports.categoryRouter.use(auth_1.requireAuth);
async function getUserMenu(userId) {
    const menu = await prisma_1.prisma.menu.findUnique({ where: { userId } });
    if (!menu)
        throw (0, errorHandler_1.createError)('No menu found. Please create a menu first.', 404);
    return menu;
}
async function existingCategorySlugs(menuId, excludeId) {
    const cats = await prisma_1.prisma.category.findMany({
        where: { menuId, ...(excludeId ? { id: { not: excludeId } } : {}) },
        select: { slug: true },
    });
    return cats.map((c) => c.slug);
}
// GET /api/categories
exports.categoryRouter.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await getUserMenu(req.user.id);
    const categories = await prisma_1.prisma.category.findMany({
        where: { menuId: menu.id },
        orderBy: { sortOrder: 'asc' },
    });
    res.json({ categories });
}));
// POST /api/categories
exports.categoryRouter.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.categoryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const menu = await getUserMenu(req.user.id);
    // Determine next sort_order
    const last = await prisma_1.prisma.category.findFirst({
        where: { menuId: menu.id },
        orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = (last?.sortOrder ?? -1) + 1;
    const slug = await (0, slug_1.uniqueSlug)(parsed.data.name, () => existingCategorySlugs(menu.id));
    const category = await prisma_1.prisma.category.create({
        data: { name: parsed.data.name, slug, menuId: menu.id, sortOrder },
    });
    res.status(201).json({ category });
}));
// PATCH /api/categories/reorder  (must be BEFORE /:id)
exports.categoryRouter.patch('/reorder', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.categoryReorderSchema.safeParse(req.body);
    if (!parsed.success) {
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const menu = await getUserMenu(req.user.id);
    // Verify all IDs belong to this menu
    const categories = await prisma_1.prisma.category.findMany({ where: { menuId: menu.id } });
    const ownedIds = new Set(categories.map((c) => c.id));
    for (const id of parsed.data.orderedIds) {
        if (!ownedIds.has(id))
            throw (0, errorHandler_1.createError)(`Category ${id} not found`, 404);
    }
    // Update sort_order in transaction
    await prisma_1.prisma.$transaction(parsed.data.orderedIds.map((id, index) => prisma_1.prisma.category.update({ where: { id }, data: { sortOrder: index } })));
    res.json({ message: 'Reordered successfully' });
}));
// PATCH /api/categories/:id
exports.categoryRouter.patch('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.categoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const menu = await getUserMenu(req.user.id);
    const existing = await prisma_1.prisma.category.findFirst({
        where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing)
        throw (0, errorHandler_1.createError)('Category not found', 404);
    let slug = existing.slug;
    if (parsed.data.name !== existing.name) {
        slug = await (0, slug_1.uniqueSlug)(parsed.data.name, () => existingCategorySlugs(menu.id, existing.id));
    }
    const category = await prisma_1.prisma.category.update({
        where: { id: req.params.id },
        data: { name: parsed.data.name, slug },
    });
    res.json({ category });
}));
// DELETE /api/categories/:id
exports.categoryRouter.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const menu = await getUserMenu(req.user.id);
    const existing = await prisma_1.prisma.category.findFirst({
        where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing)
        throw (0, errorHandler_1.createError)('Category not found', 404);
    await prisma_1.prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
}));
//# sourceMappingURL=categories.js.map