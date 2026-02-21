import { Router, Request, Response } from 'express';
import { requireAuthHtml } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const adminRouter = Router();

// /admin/* - Geriye dönük uyumluluk: role göre yönlendir
adminRouter.use(
  requireAuthHtml,
  asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.role === 'ADMIN') {
      res.redirect('/yonetim');
    } else {
      res.redirect('/panel');
    }
  })
);
