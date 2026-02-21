"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAuthHtml = requireAuthHtml;
exports.requireAdminHtml = requireAdminHtml;
exports.requireAdmin = requireAdmin;
exports.optionalAuth = optionalAuth;
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../services/prisma");
const env_1 = require("../config/env");
const JWT_SECRET = env_1.env.JWT_SECRET;
/**
 * Verifies JWT from httpOnly cookie and attaches user to req.user.
 * Returns 401 JSON if invalid.
 */
async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.[env_1.env.COOKIE_NAME];
        if (!token) {
            res.status(401).json({ error: { message: 'Kimlik doğrulama gerekli' } });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(401).json({ error: { message: 'Kullanıcı bulunamadı' } });
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch {
        res.status(401).json({ error: { message: 'Geçersiz veya süresi dolmuş token' } });
    }
}
/**
 * Same as requireAuth but redirects to /giris for HTML routes.
 */
async function requireAuthHtml(req, res, next) {
    try {
        const token = req.cookies?.[env_1.env.COOKIE_NAME];
        if (!token) {
            res.redirect(`/giris?sonra=${encodeURIComponent(req.originalUrl)}`);
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.redirect('/giris');
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch {
        res.redirect('/giris');
    }
}
/**
 * Requires ADMIN role for HTML routes.
 * Redirects to /panel if MUSTERI, /giris if not logged in.
 */
async function requireAdminHtml(req, res, next) {
    try {
        const token = req.cookies?.[env_1.env.COOKIE_NAME];
        if (!token) {
            res.redirect(`/giris?sonra=${encodeURIComponent(req.originalUrl)}`);
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.redirect('/giris');
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        if (user.role !== 'ADMIN') {
            res.redirect('/panel');
            return;
        }
        next();
    }
    catch {
        res.redirect('/giris');
    }
}
/**
 * Requires ADMIN role for API routes. Returns 403 JSON if not admin.
 */
async function requireAdmin(req, res, next) {
    try {
        const token = req.cookies?.[env_1.env.COOKIE_NAME];
        if (!token) {
            res.status(401).json({ error: { message: 'Kimlik doğrulama gerekli' } });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(401).json({ error: { message: 'Kullanıcı bulunamadı' } });
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        if (user.role !== 'ADMIN') {
            res.status(403).json({ error: { message: 'Bu işlem için yetkiniz yok' } });
            return;
        }
        next();
    }
    catch {
        res.status(401).json({ error: { message: 'Geçersiz veya süresi dolmuş token' } });
    }
}
/**
 * Optional auth: attaches user if logged in, doesn't fail if not.
 */
async function optionalAuth(req, _res, next) {
    try {
        const token = req.cookies?.[env_1.env.COOKIE_NAME];
        if (token) {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
            if (user) {
                req.user = { id: user.id, email: user.email, role: user.role };
            }
        }
    }
    catch {
        // ignore - optional auth
    }
    next();
}
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
//# sourceMappingURL=auth.js.map