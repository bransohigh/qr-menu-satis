import { Router, Request, Response } from 'express';
import { requireAuthHtml } from '../middleware/auth';
import { prisma } from '../services/prisma';
import { asyncHandler, createError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

export const panelRouter = Router();

// ─── Multer (logo yüklemeleri) ────────────────────────────────────────────────
const uploadDir = path.isAbsolute(env.UPLOAD_DIR)
  ? env.UPLOAD_DIR
  : path.join(process.cwd(), env.UPLOAD_DIR);
const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(uploadDir, 'logos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${Date.now()}${ext}`);
  },
});
const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|svg\+xml|jpeg|webp)$/.test(file.mimetype);
    cb(null, ok);
  },
});

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

// ─── GET /panel/marka — Marka kiti sayfası ────────────────────────────────────
panelRouter.get(
  '/marka',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await prisma.menu.findUnique({
      where: { userId: req.user!.id },
      include: { theme: true },
    });
    if (!menu) { res.redirect('/temalar'); return; }
    res.render('panel/marka', {
      kullanici: req.user,
      menu,
      brand: (menu.brand as Record<string, string> | null) ?? {},
      flash: req.query.flash || null,
    });
  })
);

// ─── GET /api/panel/marka — JSON ─────────────────────────────────────────────
panelRouter.get(
  '/api/marka',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await prisma.menu.findUnique({ where: { userId: req.user!.id } });
    if (!menu) { res.status(404).json({ hata: 'Menü bulunamadı' }); return; }
    res.json({ logoUrl: menu.logoUrl, brand: menu.brand });
  })
);

// ─── POST /api/panel/marka — Logo + renk güncelle ────────────────────────────
panelRouter.post(
  '/api/marka',
  logoUpload.single('logo'),
  asyncHandler(async (req: Request, res: Response) => {
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    const { primaryColor, secondaryColor, accentColor } = req.body as Record<string, string>;

    const brand: Record<string, string> = {};
    if (primaryColor && hexRe.test(primaryColor)) brand.primaryColor = primaryColor;
    if (secondaryColor && hexRe.test(secondaryColor)) brand.secondaryColor = secondaryColor;
    if (accentColor && hexRe.test(accentColor)) brand.accentColor = accentColor;

    const updateData: Record<string, unknown> = { brand };
    if (req.file) {
      updateData.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    await prisma.menu.update({
      where: { userId: req.user!.id },
      data: updateData as Parameters<typeof prisma.menu.update>[0]['data'],
    });

    // form submit → redirect
    if (req.headers['content-type']?.includes('multipart/form-data') && !req.headers['accept']?.includes('json')) {
      res.redirect('/panel/marka?flash=kaydedildi');
      return;
    }
    res.json({ mesaj: 'Marka kiti güncellendi.' });
  })
);
