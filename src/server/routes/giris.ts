import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const girisRouter = Router();

// GET /giris - Giriş/Kayıt sayfası
girisRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // Zaten giriş yapmışsa yönlendir
    if (req.user) {
      if (req.user.role === 'ADMIN') {
        res.redirect('/yonetim');
      } else {
        res.redirect('/panel');
      }
      return;
    }

    const sonra = (req.query.sonra as string) || '';
    res.render('giris/index', {
      sonra,
      hata: req.query.hata || null,
    });
  })
);
