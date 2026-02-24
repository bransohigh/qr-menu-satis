import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { sirket } from '../config/sirket';

export const kurumsalRouter = Router();

// Tüm sayfalar opsiyonel auth (nav için)
kurumsalRouter.use(optionalAuth);

// GET /hakkimizda
kurumsalRouter.get(
  '/hakkimizda',
  asyncHandler(async (req: Request, res: Response) => {
    res.render('kurumsal/hakkimizda', {
      kullanici: req.user || null,
      sirket,
    });
  })
);

// GET /iletisim
kurumsalRouter.get(
  '/iletisim',
  asyncHandler(async (req: Request, res: Response) => {
    res.render('kurumsal/iletisim', {
      kullanici: req.user || null,
      sirket,
      flash: req.query.flash || null,
    });
  })
);

// POST /iletisim — İletişim formu (basit: log + yönlendir)
kurumsalRouter.post(
  '/iletisim',
  asyncHandler(async (req: Request, res: Response) => {
    const { ad, eposta, konu, mesaj } = req.body as {
      ad: string; eposta: string; konu: string; mesaj: string;
    };
    // Gerçek uygulamada e-posta gönder (nodemailer vs.)
    console.log('[İletişim Formu]', { ad, eposta, konu, mesaj: mesaj?.slice(0, 200) });
    res.redirect('/iletisim?flash=gonderildi');
  })
);

// GET /gizlilik-politikasi
kurumsalRouter.get(
  '/gizlilik-politikasi',
  asyncHandler(async (req: Request, res: Response) => {
    res.render('kurumsal/gizlilik', {
      kullanici: req.user || null,
      sirket,
      tarih: '24 Şubat 2026',
    });
  })
);

// GET /mesafeli-satis-sozlesmesi
kurumsalRouter.get(
  '/mesafeli-satis-sozlesmesi',
  asyncHandler(async (req: Request, res: Response) => {
    res.render('kurumsal/mesafeli-satis', {
      kullanici: req.user || null,
      sirket,
      tarih: '24 Şubat 2026',
    });
  })
);

// GET /iptal-ve-iade
kurumsalRouter.get(
  '/iptal-ve-iade',
  asyncHandler(async (req: Request, res: Response) => {
    res.render('kurumsal/iptal-iade', {
      kullanici: req.user || null,
      sirket,
      tarih: '24 Şubat 2026',
    });
  })
);
