"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma_1 = require("../services/prisma");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../validators/schemas");
const errorHandler_1 = require("../middleware/errorHandler");
const env_1 = require("../config/env");
exports.authRouter = (0, express_1.Router)();
// Rate limiter for auth endpoints – max 10 requests per 15 minutes per IP
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: { message: 'Too many requests, please try again later.' } },
    standardHeaders: true,
    legacyHeaders: false,
});
// POST /api/auth/register
exports.authRouter.post('/register', authLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.registerSchema.safeParse(req.body);
    if (!parsed.success) {
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const { email, password } = parsed.data;
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw (0, errorHandler_1.createError)('Email already in use', 409);
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
        data: { email, passwordHash },
    });
    const token = (0, auth_1.signToken)(user.id);
    res.cookie(env_1.env.COOKIE_NAME, token, env_1.cookieOptions);
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
}));
// POST /api/auth/login
exports.authRouter.post('/login', authLimiter, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const parsed = schemas_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw (0, errorHandler_1.createError)('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }
    const { email, password } = parsed.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401);
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        throw (0, errorHandler_1.createError)('Invalid credentials', 401);
    }
    const token = (0, auth_1.signToken)(user.id);
    res.cookie(env_1.env.COOKIE_NAME, token, env_1.cookieOptions);
    res.json({ user: { id: user.id, email: user.email, role: user.role } });
}));
// POST /api/auth/logout
exports.authRouter.post('/logout', (_req, res) => {
    res.clearCookie(env_1.env.COOKIE_NAME, { path: '/' });
    res.json({ message: 'Çıkış yapıldı' });
});
// GET /api/auth/me
exports.authRouter.get('/me', auth_1.requireAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true, createdAt: true },
    });
    res.json({ user });
}));
//# sourceMappingURL=auth.js.map