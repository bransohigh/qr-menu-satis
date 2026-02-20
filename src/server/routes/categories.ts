import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { requireAuth } from '../middleware/auth';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryReorderSchema,
} from '../validators/schemas';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { uniqueSlug } from '../services/slug';

export const categoryRouter = Router();
categoryRouter.use(requireAuth);

async function getUserMenu(userId: string) {
  const menu = await prisma.menu.findUnique({ where: { userId } });
  if (!menu) throw createError('No menu found. Please create a menu first.', 404);
  return menu;
}

async function existingCategorySlugs(menuId: string, excludeId?: string): Promise<string[]> {
  const cats = await prisma.category.findMany({
    where: { menuId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { slug: true },
  });
  return cats.map((c) => c.slug);
}

// GET /api/categories
categoryRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await getUserMenu(req.user!.id);
    const categories = await prisma.category.findMany({
      where: { menuId: menu.id },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ categories });
  })
);

// POST /api/categories
categoryRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = categoryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const menu = await getUserMenu(req.user!.id);

    // Determine next sort_order
    const last = await prisma.category.findFirst({
      where: { menuId: menu.id },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = (last?.sortOrder ?? -1) + 1;

    const slug = await uniqueSlug(
      parsed.data.name,
      () => existingCategorySlugs(menu.id),
    );

    const category = await prisma.category.create({
      data: { name: parsed.data.name, slug, menuId: menu.id, sortOrder },
    });

    res.status(201).json({ category });
  })
);

// PATCH /api/categories/reorder  (must be BEFORE /:id)
categoryRouter.patch(
  '/reorder',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = categoryReorderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const menu = await getUserMenu(req.user!.id);

    // Verify all IDs belong to this menu
    const categories = await prisma.category.findMany({ where: { menuId: menu.id } });
    const ownedIds = new Set(categories.map((c) => c.id));

    for (const id of parsed.data.orderedIds) {
      if (!ownedIds.has(id)) throw createError(`Category ${id} not found`, 404);
    }

    // Update sort_order in transaction
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, index) =>
        prisma.category.update({ where: { id }, data: { sortOrder: index } })
      )
    );

    res.json({ message: 'Reordered successfully' });
  })
);

// PATCH /api/categories/:id
categoryRouter.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = categoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const menu = await getUserMenu(req.user!.id);
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing) throw createError('Category not found', 404);

    let slug = existing.slug;
    if (parsed.data.name !== existing.name) {
      slug = await uniqueSlug(
        parsed.data.name,
        () => existingCategorySlugs(menu.id, existing.id),
      );
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: parsed.data.name, slug },
    });

    res.json({ category });
  })
);

// DELETE /api/categories/:id
categoryRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await getUserMenu(req.user!.id);
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, menuId: menu.id },
    });
    if (!existing) throw createError('Category not found', 404);

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  })
);
