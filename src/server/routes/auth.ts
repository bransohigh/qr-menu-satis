import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { prisma } from '../services/prisma';
import { signToken, requireAuth } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/schemas';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { env, cookieOptions } from '../config/env';

export const authRouter = Router();

// Rate limiter for auth endpoints – max 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Too many requests, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
authRouter.post(
  '/register',
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw createError('Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const token = signToken(user.id);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);

    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  })
);

// POST /api/auth/login
authRouter.post(
  '/login',
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw createError('Invalid credentials', 401);
    }

    const token = signToken(user.id);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);

    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  })
);

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, { path: '/' });
  res.json({ message: 'Çıkış yapıldı' });
});

// GET /api/auth/me
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    res.json({ user });
  })
);
