import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { DEMO_KATEGORILER, DEMO_URUNLER, buildDemoMenuTR } from '../data/demoMenuTR';
import { getTemaKonfig } from './temalar';

export const onizlemeRouter = Router();

async function temaBul(slug: string) {
  return prisma.theme.findUnique({ where: { slug } });
}

// ── GET /onizleme/:temaSlug ────────────────────────────────────────────────
onizlemeRouter.get(
  '/:temaSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const tema = await temaBul(req.params.temaSlug);
    if (!tema) {
      res.status(404).render('hata/404', { baslik: 'Tema Bulunamadı', mesaj: 'Aradığınız tema mevcut değil.' });
      return;
    }

    const konfig = getTemaKonfig(tema.templateKey);
    const menu   = buildDemoMenuTR(tema.slug, tema.name);

    const urunlerKategoriye: Record<string, typeof DEMO_URUNLER> = {};
    for (const kat of DEMO_KATEGORILER) {
      urunlerKategoriye[kat.id] = DEMO_URUNLER.filter(u => u.categoryId === kat.id);
    }

    res.render('onizleme/ana', {
      tema, konfig, menu,
      kategoriler: DEMO_KATEGORILER,
      urunlerKategoriye,
      baseUrl: `/onizleme/${tema.slug}`,
      baslik: `Önizleme: ${tema.name}`,
    });
  })
);

// ── GET /onizleme/:temaSlug/k/:kategoriSlug ────────────────────────────────
onizlemeRouter.get(
  '/:temaSlug/k/:kategoriSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const tema = await temaBul(req.params.temaSlug);
    if (!tema) {
      res.status(404).render('hata/404', { baslik: 'Tema Bulunamadı', mesaj: '' });
      return;
    }

    const kategori = DEMO_KATEGORILER.find(k => k.slug === req.params.kategoriSlug);
    if (!kategori) {
      res.status(404).render('hata/404', { baslik: 'Kategori Bulunamadı', mesaj: '' });
      return;
    }

    const konfig = getTemaKonfig(tema.templateKey);
    const menu   = buildDemoMenuTR(tema.slug, tema.name);
    const urunler = DEMO_URUNLER.filter(u => u.categoryId === kategori.id);

    res.render('onizleme/kategori', {
      tema, konfig, menu, kategori,
      kategoriler: DEMO_KATEGORILER,
      urunler,
      baseUrl: `/onizleme/${tema.slug}`,
      baslik: `${kategori.name} — ${tema.name} Önizleme`,
    });
  })
);

// ── GET /onizleme/:temaSlug/u/:urunSlug ───────────────────────────────────
onizlemeRouter.get(
  '/:temaSlug/u/:urunSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const tema = await temaBul(req.params.temaSlug);
    if (!tema) {
      res.status(404).render('hata/404', { baslik: 'Tema Bulunamadı', mesaj: '' });
      return;
    }

    const urun = DEMO_URUNLER.find(u => u.slug === req.params.urunSlug);
    if (!urun) {
      res.status(404).render('hata/404', { baslik: 'Ürün Bulunamadı', mesaj: '' });
      return;
    }

    const konfig   = getTemaKonfig(tema.templateKey);
    const menu     = buildDemoMenuTR(tema.slug, tema.name);
    const kategori = DEMO_KATEGORILER.find(k => k.id === urun.categoryId);
    const kategoriUrunleri = DEMO_URUNLER.filter(u => u.categoryId === urun.categoryId && u.id !== urun.id).slice(0, 4);

    res.render('onizleme/urun', {
      tema, konfig, menu, urun, kategori, kategoriUrunleri,
      kategoriler: DEMO_KATEGORILER,
      baseUrl: `/onizleme/${tema.slug}`,
      baslik: `${urun.name} — ${tema.name} Önizleme`,
    });
  })
);
