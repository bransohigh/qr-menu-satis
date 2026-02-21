import { Router, Request, Response } from 'express';
import { requireAuthHtml } from '../middleware/auth';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../middleware/errorHandler';

export const panelRouter = Router();

// Tüm panel rotaları kimlik doğrulama gerektiriyor
panelRouter.use(requireAuthHtml);

// Yardımcı: kullanıcının menüsünü yükle
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

// GET /panel - Müşteri paneli ana sayfası
panelRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);

    if (!menu) {
      res.redirect('/temalar');
      return;
    }

    const publicUrl = `${process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`}/m/${menu.slug}`;

    res.render('panel/dashboard', {
      kullanici: req.user,
      menu,
      publicUrl,
      urunSayisi: menu.products.length,
      kategoriSayisi: menu.categories.length,
    });
  })
);

// GET /panel/kategoriler
panelRouter.get(
  '/kategoriler',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);
    if (!menu) {
      res.redirect('/temalar');
      return;
    }

    res.render('panel/kategoriler', {
      kullanici: req.user,
      menu,
      kategoriler: menu.categories,
      flash: req.query.flash || null,
    });
  })
);

// GET /panel/urunler
panelRouter.get(
  '/urunler',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);
    if (!menu) {
      res.redirect('/temalar');
      return;
    }

    const seciliKategoriId = (req.query.kategoriId as string) || '';

    const filtrelenmisUrunler = seciliKategoriId
      ? menu.products.filter((p) => p.categoryId === seciliKategoriId)
      : menu.products;

    res.render('panel/urunler', {
      kullanici: req.user,
      menu,
      kategoriler: menu.categories,
      urunler: filtrelenmisUrunler,
      seciliKategoriId,
      flash: req.query.flash || null,
    });
  })
);
