import { Router, Request, Response } from 'express';
import { requireAdminHtml } from '../middleware/auth';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../middleware/errorHandler';

export const yonetimRouter = Router();

// Tüm yönetim rotaları ADMIN yetkisi gerektiriyor
yonetimRouter.use(requireAdminHtml);

// GET /yonetim - Süper admin ana sayfası
yonetimRouter.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const [toplamKullanici, toplamMenu, toplamSatinAlim] = await Promise.all([
      prisma.user.count(),
      prisma.menu.count(),
      prisma.purchase.count(),
    ]);

    const yediGunOnce = new Date();
    yediGunOnce.setDate(yediGunOnce.getDate() - 7);

    const sonYediGunSatinAlim = await prisma.purchase.count({
      where: { createdAt: { gte: yediGunOnce } },
    });

    const sonSatinAlimlar = await prisma.purchase.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        theme: { select: { name: true } },
      },
    });

    res.render('yonetim/dashboard', {
      kullanici: _req.user,
      toplamKullanici,
      toplamMenu,
      toplamSatinAlim,
      sonYediGunSatinAlim,
      sonSatinAlimlar,
    });
  })
);

// GET /yonetim/satin-alimlar
yonetimRouter.get(
  '/satin-alimlar',
  asyncHandler(async (req: Request, res: Response) => {
    const sayfa = parseInt((req.query.sayfa as string) || '1', 10);
    const limit = 50;
    const atla = (sayfa - 1) * limit;

    const [satinAlimlar, toplamSayı] = await Promise.all([
      prisma.purchase.findMany({
        take: limit,
        skip: atla,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          theme: { select: { name: true } },
        },
      }),
      prisma.purchase.count(),
    ]);

    res.render('yonetim/satin-alimlar', {
      kullanici: req.user,
      satinAlimlar,
      toplamSayı,
      sayfa,
      toplamSayfa: Math.ceil(toplamSayı / limit),
    });
  })
);

// GET /yonetim/satin-alimlar/:id
yonetimRouter.get(
  '/satin-alimlar/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const satinAlim = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, id: true } },
        theme: true,
      },
    });

    if (!satinAlim) {
      res.status(404).render('hata/404', { mesaj: 'Satın alım bulunamadı' });
      return;
    }

    res.render('yonetim/satin-alim-detay', {
      kullanici: req.user,
      satinAlim,
    });
  })
);

// POST /yonetim/satin-alimlar/:id/durum - FakePay durumu güncelle
yonetimRouter.post(
  '/satin-alimlar/:id/durum',
  asyncHandler(async (req: Request, res: Response) => {
    const { durum } = req.body;
    const gecerliDurumlar = ['pending', 'paid', 'failed', 'refunded'];
    if (!gecerliDurumlar.includes(durum)) {
      res.status(400).json({ error: 'Geçersiz durum' });
      return;
    }

    await prisma.purchase.update({
      where: { id: req.params.id },
      data: { status: durum },
    });

    res.redirect(`/yonetim/satin-alimlar/${req.params.id}?flash=guncellendi`);
  })
);

// GET /yonetim/menuler
yonetimRouter.get(
  '/menuler',
  asyncHandler(async (req: Request, res: Response) => {
    const arama = (req.query.arama as string) || '';
    const sayfa = parseInt((req.query.sayfa as string) || '1', 10);
    const limit = 50;
    const atla = (sayfa - 1) * limit;

    const where = arama
      ? {
          OR: [
            { businessName: { contains: arama, mode: 'insensitive' as const } },
            { user: { email: { contains: arama, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [menuler, toplamSayi] = await Promise.all([
      prisma.menu.findMany({
        where,
        take: limit,
        skip: atla,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          theme: { select: { name: true } },
          _count: { select: { categories: true, products: true } },
        },
      }),
      prisma.menu.count({ where }),
    ]);

    res.render('yonetim/menuler', {
      kullanici: req.user,
      menuler,
      toplamSayi,
      sayfa,
      toplamSayfa: Math.ceil(toplamSayi / limit),
      arama,
    });
  })
);

// GET /yonetim/menuler/:menuId - Menü düzenleme (admin olarak)
yonetimRouter.get(
  '/menuler/:menuId',
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await prisma.menu.findUnique({
      where: { id: req.params.menuId },
      include: {
        user: { select: { email: true } },
        theme: true,
        categories: { orderBy: { sortOrder: 'asc' } },
        products: { include: { category: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!menu) {
      res.status(404).render('hata/404', { mesaj: 'Menü bulunamadı' });
      return;
    }

    const seciliKategoriId = (req.query.kategoriId as string) || '';
    const filtrelenmisUrunler = seciliKategoriId
      ? menu.products.filter((p) => p.categoryId === seciliKategoriId)
      : menu.products;

    res.render('yonetim/menu-duzenle', {
      kullanici: req.user,
      menu,
      kategoriler: menu.categories,
      urunler: filtrelenmisUrunler,
      seciliKategoriId,
      flash: req.query.flash || null,
    });
  })
);

// GET /yonetim/kullanicilar
yonetimRouter.get(
  '/kullanicilar',
  asyncHandler(async (req: Request, res: Response) => {
    const arama = (req.query.arama as string) || '';
    const sayfa = parseInt((req.query.sayfa as string) || '1', 10);
    const limit = 50;
    const atla = (sayfa - 1) * limit;

    const where = arama
      ? { email: { contains: arama, mode: 'insensitive' as const } }
      : {};

    const [kullanicilar, toplamSayi] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: atla,
        orderBy: { createdAt: 'desc' },
        include: {
          menu: { select: { id: true, slug: true, businessName: true } },
          purchases: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true, status: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.render('yonetim/kullanicilar', {
      kullanici: req.user,
      kullanicilar,
      toplamSayi,
      sayfa,
      toplamSayfa: Math.ceil(toplamSayi / limit),
      arama,
    });
  })
);

// GET /yonetim/kullanicilar/:userId
yonetimRouter.get(
  '/kullanicilar/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const hedefKullanici = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: {
        menu: {
          include: {
            theme: true,
            _count: { select: { categories: true, products: true } },
          },
        },
        purchases: {
          orderBy: { createdAt: 'desc' },
          include: { theme: { select: { name: true } } },
        },
      },
    });

    if (!hedefKullanici) {
      res.status(404).render('hata/404', { mesaj: 'Kullanıcı bulunamadı' });
      return;
    }

    res.render('yonetim/kullanici-detay', {
      kullanici: req.user,
      hedefKullanici,
      flash: req.query.flash || null,
    });
  })
);

// POST /yonetim/kullanicilar/:userId/rol - Kullanıcı rolünü değiştir
yonetimRouter.post(
  '/kullanicilar/:userId/rol',
  asyncHandler(async (req: Request, res: Response) => {
    const { rol } = req.body;

    if (rol !== 'MUSTERI' && rol !== 'ADMIN') {
      res.status(400).json({ error: 'Geçersiz rol' });
      return;
    }

    // Kendi rolünü değiştirmeyi engelle
    if (req.params.userId === req.user!.id) {
      res.redirect(`/yonetim/kullanicilar/${req.params.userId}?flash=kendi-rol`);
      return;
    }

    await prisma.user.update({
      where: { id: req.params.userId },
      data: { role: rol },
    });

    res.redirect(`/yonetim/kullanicilar/${req.params.userId}?flash=rol-guncellendi`);
  })
);
