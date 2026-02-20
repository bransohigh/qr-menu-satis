import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma';
import { env } from '../config/env';

export interface AuthUser {
  id: string;
  email: string;
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
      res.status(401).json({ error: { message: 'Authentication required' } });
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.status(401).json({ error: { message: 'User not found' } });
      return;
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

/**
 * Same as requireAuth but redirects to /temalar (login form) for HTML routes.
 */
export async function requireAuthHtml(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      res.redirect(`/temalar?giris=${encodeURIComponent(req.originalUrl)}`);
      return;
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.redirect('/temalar');
      return;
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    res.redirect('/temalar');
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
        req.user = { id: user.id, email: user.email };
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
