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

// GET /panel/tasarimlar — Satın alınan temalarda aktif tema seçimi
panelRouter.get(
  '/tasarimlar',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await loadUserMenu(req.user!.id);

    // Kullanıcının ödendi durumundaki satın alımları ve tema detayları
    const satinAlimlar = await prisma.purchase.findMany({
      where: { userId: req.user!.id, status: 'paid' },
      include: { theme: true },
      orderBy: { createdAt: 'desc' },
    });

    res.render('panel/tasarimlar', {
      kullanici: req.user,
      menu,
      satinAlimlar,
      flash: req.query.flash || null,
    });
  })
);

// POST /panel/tasarim-sec — Aktif temayı güncelle
panelRouter.post(
  '/tasarim-sec',
  asyncHandler(async (req: Request, res: Response) => {
    const { themeId } = req.body as { themeId: string };

    if (!themeId) {
      res.redirect('/panel/tasarimlar?flash=hata-no-theme');
      return;
    }

    // Kullanıcının bu temayı satın aldığını doğrula
    const satin = await prisma.purchase.findFirst({
      where: { userId: req.user!.id, themeId, status: 'paid' },
    });

    if (!satin) {
      res.redirect('/panel/tasarimlar?flash=hata-yetkisiz');
      return;
    }

    // Menü themeId güncelle
    await prisma.menu.update({
      where: { userId: req.user!.id },
      data: { themeId },
    });

    res.redirect('/panel/tasarimlar?flash=basarili');
  })
);

// GET /panel/siparisler — Satın alım geçmişi
panelRouter.get(
  '/siparisler',
  asyncHandler(async (req: Request, res: Response) => {
    const satinAlimlar = await prisma.purchase.findMany({
      where: { userId: req.user!.id },
      include: { theme: true },
      orderBy: { createdAt: 'desc' },
    });

    res.render('panel/siparisler', {
      kullanici: req.user,
      satinAlimlar,
      flash: req.query.flash || null,
    });
  })
);

// ─── API: Tasarım seçimi ─────────────────────────────────────────────────────

// GET /api/panel/tasarimlar
panelRouter.get(
  '/api/tasarimlar',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await prisma.menu.findUnique({
      where: { userId: req.user!.id },
      select: { themeId: true },
    });

    const satinAlimlar = await prisma.purchase.findMany({
      where: { userId: req.user!.id, status: 'paid' },
      include: { theme: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      aktifThemeId: menu?.themeId || null,
      satinAlinanTemalar: satinAlimlar.map((s) => ({
        purchaseId: s.id,
        themeId: s.themeId,
        temaAdi: s.theme.name,
        temaSlug: s.theme.slug,
        onizlemeFoto: s.theme.previewImage,
        aciklama: s.theme.description,
        satinAlinmaTarihi: s.createdAt,
      })),
    });
  })
);

// POST /api/panel/tasarim-sec
panelRouter.post(
  '/api/tasarim-sec',
  asyncHandler(async (req: Request, res: Response) => {
    const { themeId } = req.body as { themeId: string };

    if (!themeId) {
      res.status(400).json({ hata: 'themeId gerekli' });
      return;
    }

    const satin = await prisma.purchase.findFirst({
      where: { userId: req.user!.id, themeId, status: 'paid' },
    });

    if (!satin) {
      res.status(403).json({ hata: 'Bu temayı satın almadınız.' });
      return;
    }

    const menu = await prisma.menu.update({
      where: { userId: req.user!.id },
      data: { themeId },
      include: { theme: true },
    });

    res.json({ mesaj: 'Tasarım güncellendi.', aktifTema: menu.theme.name });
  })
);
