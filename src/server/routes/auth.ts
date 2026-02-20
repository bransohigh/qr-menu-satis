import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { prisma } from '../services/prisma';
import { signToken, requireAuth } from '../middleware/auth';
import { registerSchema, loginSchema } from '../validators/schemas';
import { asyncHandler, createError } from '../middleware/errorHandler';

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
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ user: { id: user.id, email: user.email } });
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
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, email: user.email } });
  })
);

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, createdAt: true },
    });
    res.json({ user });
  })
);
