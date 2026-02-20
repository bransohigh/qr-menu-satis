import { Router, Request, Response } from 'express';
import { requireAuthHtml } from '../middleware/auth';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../middleware/errorHandler';

export const adminRouter = Router();

// All admin routes require HTML auth (redirects on failure)
adminRouter.use(requireAuthHtml);

// Helper: load user menu with full data
async function loadUserMenu(userId: string) {
  return prisma.menu.findUnique({
    where: { userId },
    include: {
      theme: true,
      categories: { orderBy: { sortOrder: 'asc' } },
      products: { include: { category: true }, orderBy: { createdAt: 'asc' } },
    },
  });
}

// GET /admin - Dashboard
adminRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);

    // If user has no menu, redirect to themes
    if (!menu) {
      res.redirect('/themes');
      return;
    }

    const publicUrl = `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`}/m/${menu.slug}`;

    res.render('admin/dashboard', {
      user: req.user,
      menu,
      publicUrl,
      productCount: menu.products.length,
      categoryCount: menu.categories.length,
    });
  })
);

// GET /admin/categories
adminRouter.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);
    if (!menu) {
      res.redirect('/themes');
      return;
    }

    res.render('admin/categories', {
      user: req.user,
      menu,
      categories: menu.categories,
      flash: req.query.flash || null,
    });
  })
);

// GET /admin/products
adminRouter.get(
  '/products',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);
    if (!menu) {
      res.redirect('/themes');
      return;
    }

    const selectedCategoryId = (req.query.categoryId as string) || '';

    const filteredProducts = selectedCategoryId
      ? menu.products.filter((p) => p.categoryId === selectedCategoryId)
      : menu.products;

    res.render('admin/products', {
      user: req.user,
      menu,
      categories: menu.categories,
      products: filteredProducts,
      selectedCategoryId,
      flash: req.query.flash || null,
    });
  })
);
