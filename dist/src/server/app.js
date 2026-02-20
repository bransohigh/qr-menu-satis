"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./config/env");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./routes/auth");
const themes_1 = require("./routes/themes");
const menus_1 = require("./routes/menus");
const categories_1 = require("./routes/categories");
const products_1 = require("./routes/products");
const admin_1 = require("./routes/admin");
const publicMenu_1 = require("./routes/publicMenu");
const qr_1 = require("./routes/qr");
const preview_1 = require("./routes/preview");
const checkout_1 = require("./routes/checkout");
const fakepay_1 = require("./routes/fakepay");
const temalar_1 = require("./routes/temalar");
const onizleme_1 = require("./routes/onizleme");
const odeme_1 = require("./routes/odeme");
const app = (0, express_1.default)();
const PORT = env_1.env.PORT;
// ─── Reverse proxy (Hostinger, Nginx vb.) ───────────────────────────────────
if (env_1.env.TRUST_PROXY) {
    app.set('trust proxy', 1);
}
// ─── Security headers ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // 'unsafe-inline' covers inline <script> blocks
            // 'unsafe-hashes' is not needed once scriptSrcAttr is set below
            scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdn.tailwindcss.com'],
            // Allow inline onclick/onchange attributes (needed for EJS admin views)
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdn.jsdelivr.net', 'cdn.tailwindcss.com'],
            fontSrc: ["'self'", 'fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'blob:', 'images.unsplash.com'],
            // Tailwind CDN uses style injection via JS – needs connect-src for its endpoint
            connectSrc: ["'self'"],
        },
    },
}));
// ─── View engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(process.cwd(), 'src/views'));
// ─── Body parsing, cookies, logging ─────────────────────────────────────────
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Production'da 'combined' (Apache formatı, log toplayıcılarla uyumlu)
app.use((0, morgan_1.default)(env_1.isProd ? 'combined' : 'dev'));
// ─── Static files ────────────────────────────────────────────────────────────
app.use('/public', express_1.default.static(path_1.default.join(process.cwd(), 'public')));
// UPLOAD_DIR env ile konfigüre edilir; mutlak ya da proje köküne göre göreli olabilir
const uploadDir = path_1.default.isAbsolute(env_1.env.UPLOAD_DIR)
    ? env_1.env.UPLOAD_DIR
    : path_1.default.join(__dirname, '../../', env_1.env.UPLOAD_DIR);
app.use('/uploads', express_1.default.static(uploadDir));
// ─── Healthcheck ─────────────────────────────────────────────────────────────
app.get('/saglik', (_req, res) => {
    res.json({ durum: 'ok', ortam: env_1.env.NODE_ENV, zaman: new Date().toISOString() });
});
// ─── Redirect root to themes ─────────────────────────────────────────────────
app.get('/', (_req, res) => res.redirect('/temalar'));
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_1.authRouter);
app.use('/api/menus', menus_1.menuRouter);
app.use('/api/categories', categories_1.categoryRouter);
app.use('/api/products', products_1.productRouter);
app.use('/api/qr', qr_1.qrRouter);
app.use('/themes', themes_1.themeRouter);
app.use('/temalar', temalar_1.temalarRouter);
app.use('/onizleme', onizleme_1.onizlemeRouter);
app.use('/odeme', odeme_1.odemeRouter);
app.use('/admin', admin_1.adminRouter);
app.use('/m', publicMenu_1.publicMenuRouter);
app.use('/preview', preview_1.previewRouter);
app.use('/pay', fakepay_1.fakepayRouter);
app.use('/api/checkout', checkout_1.checkoutRouter);
app.use('/api/webhooks', checkout_1.checkoutRouter);
app.use('/checkout', checkout_1.checkoutRouter);
// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Start server ────────────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
    console.error('[HATA] Yakalanmamış istisna:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('[HATA] Yakalanmamış promise reddi:', reason);
    process.exit(1);
});
try {
    app.listen(PORT, () => {
        console.log(`🚀 QR Menü çalışıyor → ${env_1.env.APP_URL} (port ${PORT}) [${env_1.env.NODE_ENV}]`);
        console.log(`📁 Views: ${process.cwd()}/src/views`);
        console.log(`📁 CWD: ${process.cwd()}`);
    });
}
catch (err) {
    console.error('[HATA] Sunucu başlatılamadı:', err);
    process.exit(1);
}
exports.default = app;
//# sourceMappingURL=app.js.map