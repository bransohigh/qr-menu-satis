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
    tema_01: { duzen: 'koy-kahvaltisi',   koyuMod: false, vurgRenk: 'amber',  aciklama: 'Sıcak amber tonları ve rustik serif tipografi' },
    tema_02: { duzen: 'vegan-minimal',    koyuMod: false, vurgRenk: 'green',  aciklama: 'Temiz beyaz-yeşil, yuvarlak görseller, bol boşluk' },
    tema_03: { duzen: 'sushi-kartlar',    koyuMod: true,  vurgRenk: 'indigo', aciklama: 'Koyu zemin, indigo aksanlar, asil kart grid düzeni' },
    tema_04: { duzen: 'premium-koyu',     koyuMod: true,  vurgRenk: 'purple', aciklama: 'Glassmorphism kartlar, mor gradient, lüks görünüm' },
    tema_05: { duzen: 'bistro-editoryal', koyuMod: false, vurgRenk: 'zinc',   aciklama: 'Siyah-beyaz editoryal tipografi, gazete tarzı düzen' },
    tema_06: { duzen: 'modern-galeri',    koyuMod: false, vurgRenk: 'sky',    aciklama: 'Geniş hero banner, sky mavi vurgular, galeri grid' },
    // Legacy aliases (eski temalar geçici uyum için)
    tema_07: { duzen: 'modern-galeri',    koyuMod: false, vurgRenk: 'sky',    aciklama: 'Modern galeri düzeni' },
    tema_08: { duzen: 'vegan-minimal',    koyuMod: false, vurgRenk: 'green',  aciklama: 'Minimal düzen' },
    tema_09: { duzen: 'koy-kahvaltisi',   koyuMod: false, vurgRenk: 'amber',  aciklama: 'Rustik düzen' },
    tema_10: { duzen: 'premium-koyu',     koyuMod: true,  vurgRenk: 'purple', aciklama: 'Premium koyu düzen' },
    // Yeni temalar (tema_11 – tema_16)
    tema_11: { duzen: 'premium-koyu',     koyuMod: true,  vurgRenk: 'rose',   aciklama: 'Lüks koyu zemin, gül rengi vurgular, premium restoran teması' },
    tema_12: { duzen: 'vegan-minimal',    koyuMod: false, vurgRenk: 'stone',  aciklama: 'Sade bej-taş tonları, minimal kafe tasarımı' },
    tema_13: { duzen: 'sushi-kartlar',    koyuMod: true,  vurgRenk: 'red',    aciklama: 'Asya estetiği, kırmızı vurgular, koyu kartlı grid' },
    tema_14: { duzen: 'koy-kahvaltisi',   koyuMod: false, vurgRenk: 'orange', aciklama: 'Turuncu kasaba dokunuşları, köy büfesi sıcaklığı' },
    tema_15: { duzen: 'bistro-editoryal', koyuMod: false, vurgRenk: 'pink',   aciklama: 'Pembe pastel vurgular, şık pastane editoryal düzeni' },
    tema_16: { duzen: 'modern-galeri',    koyuMod: false, vurgRenk: 'yellow', aciklama: 'Sarı enerjik vurgular, adrenalinli burger menü tasarımı' },
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
