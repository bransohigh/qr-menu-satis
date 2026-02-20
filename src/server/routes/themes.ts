import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const themeRouter = Router();

// GET /themes/api/list - JSON list of all themes (for test scripts, future SPA use)
themeRouter.get(
  '/api/list',
  asyncHandler(async (_req: Request, res: Response) => {
    const themes = await prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ themes });
  })
);
themeRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const themes = await prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });

    // Check if user already has a menu
    let userMenu = null;
    if (req.user) {
      userMenu = await prisma.menu.findUnique({ where: { userId: req.user.id } });
    }

    const redirectAfter = (req.query.redirect as string) || '/admin';

    res.render('themes/index', {
      themes,
      user: req.user || null,
      userMenu,
      redirectAfter,
      flash: req.query.flash || null,
    });
  })
);

// GET /themes/:themeSlug — theme detail / marketing page
themeRouter.get(
  '/:themeSlug',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { themeSlug } = req.params;
    const theme = await prisma.theme.findUnique({ where: { slug: themeSlug } });
    if (!theme) throw createError('Theme not found', 404);

    let hasPurchased = false;
    if (req.user) {
      const purchase = await prisma.purchase.findFirst({
        where: { userId: req.user.id, status: 'paid' },
      });
      hasPurchased = !!purchase;
    }

    res.render('themes/detail', {
      theme,
      user: req.user || null,
      hasPurchased,
    });
  })
);
