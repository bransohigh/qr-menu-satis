import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../services/prisma';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const qrRouter = Router();

// GET /api/qr - Generate QR code PNG for the authenticated user's menu
qrRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const menu = await prisma.menu.findUnique({ where: { userId: req.user!.id } });
    if (!menu) throw createError('No menu found', 404);

    const publicUrl = `${process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`}/m/${menu.slug}`;
    const qrBuffer = await QRCode.toBuffer(publicUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${menu.slug}.png"`);
    res.send(qrBuffer);
  })
);
