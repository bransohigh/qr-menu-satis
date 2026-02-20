import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const odemeRouter = Router();

function nanoid(n = 6): string {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let r = ''; for (let i = 0; i < n; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}

async function menuSlugUret(isletmeAdi?: string): Promise<string> {
  const taban = isletmeAdi
    ? isletmeAdi.toLowerCase()
        .replace(/[^a-z0-9çğışöüÇĞİŞÖÜ]/gi, '-')
        .replace(/[çÇ]/g,'c').replace(/[ğĞ]/g,'g').replace(/[ışİŞ]/g,'is')
        .replace(/[öÖ]/g,'o').replace(/[üÜ]/g,'u')
        .replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'menu'
    : 'menu';
  let slug = `${taban}-${nanoid(6)}`;
  while (await prisma.menu.findUnique({ where: { slug } })) {
    slug = `${taban}-${nanoid(6)}`;
  }
  return slug;
}

// ── GET /odeme/simule?temaId=... ────────────────────────────────────────────
odemeRouter.get(
  '/simule',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { temaId, temaSlug } = req.query as { temaId?: string; temaSlug?: string };

    let tema = null;
    if (temaId) {
      tema = await prisma.theme.findUnique({ where: { id: temaId } });
    } else if (temaSlug) {
      tema = await prisma.theme.findUnique({ where: { slug: temaSlug } });
    }

    if (!tema) throw createError('Tema bulunamadı', 404);

    res.render('odeme/simule', {
      tema,
      kullanici: req.user || null,
    });
  })
);

// ── POST /odeme/tamamla ─────────────────────────────────────────────────────
odemeRouter.post(
  '/tamamla',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { temaId, isletmeAdi, iptal } = req.body as {
      temaId?: string; isletmeAdi?: string; iptal?: string;
    };

    if (iptal === '1') {
      return res.redirect('/temalar?flash=iptal');
    }

    if (!temaId) throw createError('Tema ID gerekli', 400);

    const tema = await prisma.theme.findUnique({ where: { id: temaId } });
    if (!tema) throw createError('Tema bulunamadı', 404);

    // Mevcut ödeme var mı?
    const mevcutOdeme = await prisma.purchase.findFirst({
      where: { userId: req.user!.id, status: 'paid' },
    });

    let purchase;
    if (mevcutOdeme) {
      purchase = mevcutOdeme;
    } else {
      purchase = await prisma.purchase.create({
        data: {
          userId:      req.user!.id,
          themeId:     tema.id,
          amount:      Number(tema.price),
          currency:    tema.currency || 'TRY',
          status:      'paid',
          provider:    'simule',
          providerRef: `sim_${nanoid(12)}`,
        },
      });
    }

    // Kullanıcı menüsü oluştur (yoksa)
    const mevcutMenu = await prisma.menu.findUnique({ where: { userId: req.user!.id } });
    if (!mevcutMenu) {
      const slug = await menuSlugUret(isletmeAdi);
      await prisma.menu.create({
        data: {
          userId:       req.user!.id,
          themeId:      tema.id,
          slug,
          businessName: isletmeAdi || 'İşletmem',
        },
      });
    }

    res.redirect(`/odeme/basari?satinAlimId=${purchase.id}`);
  })
);

// ── GET /odeme/basari ───────────────────────────────────────────────────────
odemeRouter.get(
  '/basari',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { satinAlimId } = req.query as { satinAlimId?: string };
    let satinAlim = null;
    if (satinAlimId) {
      satinAlim = await prisma.purchase.findUnique({
        where: { id: satinAlimId },
        include: { theme: true },
      });
    }
    res.render('odeme/basari', {
      kullanici: req.user || null,
      satinAlim,
    });
  })
);

// ── GET /odeme/iptal ────────────────────────────────────────────────────────
odemeRouter.get(
  '/iptal',
  asyncHandler(async (_req: Request, res: Response) => {
    res.render('odeme/iptal', {});
  })
);
