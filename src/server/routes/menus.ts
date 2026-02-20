import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';

function nanoid(size = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
import { requireAuth } from '../middleware/auth';
import { createMenuSchema } from '../validators/schemas';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const menuRouter = Router();

// Helper: generate unique slug from businessName or random
async function generateSlug(businessName?: string): Promise<string> {
  const base = businessName
    ? businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30) || 'menu'
    : 'menu';

  let slug = `${base}-${nanoid(6)}`;
  // Ensure uniqueness
  while (await prisma.menu.findUnique({ where: { slug } })) {
    slug = `${base}-${nanoid(6)}`;
  }
  return slug;
}

// POST /api/menus/create-from-theme
// Creates a menu for the authenticated user with the selected theme.
menuRouter.post(
  '/create-from-theme',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = createMenuSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { themeId, businessName } = parsed.data;

    // Check if user already has a menu
    const existingMenu = await prisma.menu.findUnique({ where: { userId: req.user!.id } });
    if (existingMenu) {
      // Redirect to admin - user already has a menu
      res.json({ redirect: '/admin', message: 'You already have a menu' });
      return;
    }

    // Verify theme exists
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) {
      throw createError('Theme not found', 404);
    }

    const slug = await generateSlug(businessName);

    const menu = await prisma.menu.create({
      data: {
        userId: req.user!.id,
        themeId,
        slug,
        businessName: businessName || null,
      },
      include: { theme: true },
    });

    res.status(201).json({ menu, redirect: '/admin' });
  })
);
