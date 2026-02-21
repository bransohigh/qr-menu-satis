import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma';
import { env } from '../config/env';

export interface AuthUser {
  id: string;
  email: string;
  role: 'MUSTERI' | 'ADMIN';
}

// Extend Express Request to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = env.JWT_SECRET;

/**
 * Verifies JWT from httpOnly cookie and attaches user to req.user.
 * Returns 401 JSON if invalid.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      res.status(401).json({ error: { message: 'Kimlik doğrulama gerekli' } });
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.status(401).json({ error: { message: 'Kullanıcı bulunamadı' } });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role as 'MUSTERI' | 'ADMIN' };
    next();
  } catch {
    res.status(401).json({ error: { message: 'Geçersiz veya süresi dolmuş token' } });
  }
}

/**
 * Same as requireAuth but redirects to /giris for HTML routes.
 */
export async function requireAuthHtml(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      res.redirect(`/giris?sonra=${encodeURIComponent(req.originalUrl)}`);
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.redirect('/giris');
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role as 'MUSTERI' | 'ADMIN' };
    next();
  } catch {
    res.redirect('/giris');
  }
}

/**
 * Requires ADMIN role for HTML routes.
 * Redirects to /panel if MUSTERI, /giris if not logged in.
 */
export async function requireAdminHtml(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      res.redirect(`/giris?sonra=${encodeURIComponent(req.originalUrl)}`);
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.redirect('/giris');
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role as 'MUSTERI' | 'ADMIN' };

    if (user.role !== 'ADMIN') {
      res.redirect('/panel');
      return;
    }

    next();
  } catch {
    res.redirect('/giris');
  }
}

/**
 * Requires ADMIN role for API routes. Returns 403 JSON if not admin.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      res.status(401).json({ error: { message: 'Kimlik doğrulama gerekli' } });
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.status(401).json({ error: { message: 'Kullanıcı bulunamadı' } });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role as 'MUSTERI' | 'ADMIN' };

    if (user.role !== 'ADMIN') {
      res.status(403).json({ error: { message: 'Bu işlem için yetkiniz yok' } });
      return;
    }

    next();
  } catch {
    res.status(401).json({ error: { message: 'Geçersiz veya süresi dolmuş token' } });
  }
}

/**
 * Optional auth: attaches user if logged in, doesn't fail if not.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (user) {
        req.user = { id: user.id, email: user.email, role: user.role as 'MUSTERI' | 'ADMIN' };
      }
    }
  } catch {
    // ignore - optional auth
  }
  next();
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
