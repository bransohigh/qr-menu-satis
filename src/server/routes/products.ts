import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../services/prisma';
import { requireAuth } from '../middleware/auth';
import { productCreateSchema, productUpdateSchema } from '../validators/schemas';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { uniqueSlug } from '../services/slug';

export const productRouter = Router();
productRouter.use(requireAuth);

async function existingProductSlugs(menuId: string, excludeId?: string): Promise<string[]> {
  const prods = await prisma.product.findMany({
    where: { menuId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  return prods.map((p) => p.slug);
}

// ─── Multer config ────────────────────────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper: get current user's menu
async function getUserMenu(userId: string) {
  const menu = await prisma.menu.findUnique({ where: { userId } });
  if (!menu) throw createError('No menu found. Please create a menu first.', 404);
  return menu;
}

// GET /api/products
productRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await getUserMenu(req.user!.id);
    const categoryId = req.query.categoryId as string | undefined;

    const products = await prisma.product.findMany({
      where: { menuId: menu.id, ...(categoryId ? { categoryId } : {}) },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ products });
  })
);

// POST /api/products
productRouter.post(
  '/',
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      // clean up uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const menu = await getUserMenu(req.user!.id);

    // Verify category belongs to this menu
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, menuId: menu.id },
    });
    if (!category) {
      if (req.file) fs.unlinkSync(req.file.path);
      throw createError('Category not found', 404);
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const slug = await uniqueSlug(
      parsed.data.name,
      () => existingProductSlugs(menu.id),
    );

    const product = await prisma.product.create({
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
  })
);

// PATCH /api/products/:id
productRouter.patch(
  '/:id',
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) fs.unlinkSync(req.file.path);
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const menu = await getUserMenu(req.user!.id);
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      throw createError('Product not found', 404);
    }

    // If new image uploaded, delete old one
    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (existing.imageUrl) {
        const oldPath = path.join(process.cwd(), existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const data: Record<string, unknown> = { imageUrl };
    if (parsed.data.name) {
      data.name = parsed.data.name;
      // Regenerate slug if name changed
      if (parsed.data.name !== existing.name) {
        data.slug = await uniqueSlug(
          parsed.data.name,
          () => existingProductSlugs(menu.id, existing.id),
        );
      }
    }
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.price) data.price = parsed.data.price;
    if (parsed.data.categoryId) {
      // Verify category
      const cat = await prisma.category.findFirst({
        where: { id: parsed.data.categoryId, menuId: menu.id },
      });
      if (!cat) throw createError('Category not found', 404);
      data.categoryId = parsed.data.categoryId;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });

    res.json({ product });
  })
);

// DELETE /api/products/:id
productRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await getUserMenu(req.user!.id);
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing) throw createError('Product not found', 404);

    // Delete image file
    if (existing.imageUrl) {
      const imgPath = path.join(process.cwd(), existing.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  })
);
