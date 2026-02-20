import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const temalarRouter = Router();

// ─── Yardımcı: Tema konfigürasyonu ──────────────────────────────────────────
export function getTemaKonfig(templateKey: string) {
  const configs: Record<string, {
    duzen: string; koyuMod: boolean; vurgRenk: string; aciklama: string;
  }> = {
    tema_01: { duzen: 'klasik-liste',    koyuMod: false, vurgRenk: 'slate',   aciklama: 'Temiz ve okunması kolay klasik liste düzeni' },
    tema_02: { duzen: 'kart-duzen',      koyuMod: false, vurgRenk: 'violet',  aciklama: 'Görsel ağırlıklı büyük kart grid yapısı' },
    tema_03: { duzen: 'minimal',         koyuMod: false, vurgRenk: 'stone',   aciklama: 'Çok boşluk ve büyük tipografi odaklı minimal tasarım' },
    tema_04: { duzen: 'gece-modu',       koyuMod: true,  vurgRenk: 'cyan',    aciklama: 'Neon vurgulu göz dostu koyu tema' },
    tema_05: { duzen: 'kapakli',         koyuMod: false, vurgRenk: 'amber',   aciklama: 'Büyük hero alanı ve sekmeli kategori gezintisi' },
    tema_06: { duzen: 'sol-menu',        koyuMod: false, vurgRenk: 'emerald', aciklama: 'Desktop\'ta sol panel kategori navigasyonu' },
    tema_07: { duzen: 'kategori-seridi', koyuMod: false, vurgRenk: 'rose',    aciklama: 'Üstte yapışkan kayar kategori çubuğu' },
    tema_08: { duzen: 'gorsel-odakli',   koyuMod: false, vurgRenk: 'orange',  aciklama: 'Ürün fotoğrafı ana alan, içerik alt üstte' },
    tema_09: { duzen: 'kompakt',         koyuMod: false, vurgRenk: 'teal',    aciklama: 'Fiyat sağda, yoğun ve hızlı taranabilen liste' },
    tema_10: { duzen: 'premium',         koyuMod: true,  vurgRenk: 'purple',  aciklama: 'Cam efekti (glassmorphism) ve yumuşak animasyonlar' },
  };
  return configs[templateKey] || configs['tema_01'];
}

// ─── GET /temalar ─────────────────────────────────────────────────────────────
temalarRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const temalar = await prisma.theme.findMany({ orderBy: { createdAt: 'asc' } });

    let kullaniciMenusu = null;
    if (req.user) {
      kullaniciMenusu = await prisma.menu.findUnique({ where: { userId: req.user.id } });
    }

    res.render('temalar/index', {
      temalar,
      kullanici: req.user || null,
      kullaniciMenusu,
      getTemaKonfig,
      flash: req.query.flash || null,
    });
  })
);

// ─── GET /temalar/:temaSlug ───────────────────────────────────────────────────
temalarRouter.get(
  '/:temaSlug',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { temaSlug } = req.params;
    const tema = await prisma.theme.findUnique({ where: { slug: temaSlug } });
    if (!tema) throw createError('Tema bulunamadı', 404);

    const konfig = getTemaKonfig(tema.templateKey);

    let satin_alindi = false;
    if (req.user) {
      const satin_alim = await prisma.purchase.findFirst({
        where: { userId: req.user.id, status: 'paid' },
      });
      satin_alindi = !!satin_alim;
    }

    res.render('temalar/detay', {
      tema,
      konfig,
      kullanici: req.user || null,
      satin_alindi,
    });
  })
);
