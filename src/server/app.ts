import 'dotenv/config';
import { env, isProd } from './config/env';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { themeRouter } from './routes/themes';
import { menuRouter } from './routes/menus';
import { categoryRouter } from './routes/categories';
import { productRouter } from './routes/products';
import { adminRouter } from './routes/admin';
import { publicMenuRouter } from './routes/publicMenu';
import { qrRouter } from './routes/qr';
import { previewRouter } from './routes/preview';
import { checkoutRouter } from './routes/checkout';
import { fakepayRouter } from './routes/fakepay';
import { temalarRouter } from './routes/temalar';
import { onizlemeRouter } from './routes/onizleme';
import { odemeRouter } from './routes/odeme';

const app = express();
const PORT = env.PORT;

// ─── Reverse proxy (Hostinger, Nginx vb.) ───────────────────────────────────
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// ─── Security headers ───────────────────────────────────────────────────────
app.use(
  helmet({
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
  })
);

// ─── View engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'));

// ─── Body parsing, cookies, logging ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Production'da 'combined' (Apache formatı, log toplayıcılarla uyumlu)
app.use(morgan(isProd ? 'combined' : 'dev'));

// ─── Static files ────────────────────────────────────────────────────────────
app.use('/public', express.static(path.join(process.cwd(), 'public')));
// UPLOAD_DIR env ile konfigüre edilir; mutlak ya da proje köküne göre göreli olabilir
const uploadDir = path.isAbsolute(env.UPLOAD_DIR)
  ? env.UPLOAD_DIR
  : path.join(__dirname, '../../', env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadDir));

// ─── Healthcheck ─────────────────────────────────────────────────────────────
app.get('/saglik', (_req, res) => {
  res.json({ durum: 'ok', ortam: env.NODE_ENV, zaman: new Date().toISOString() });
});

// ─── Redirect root to themes ─────────────────────────────────────────────────
app.get('/', (_req, res) => res.redirect('/temalar'));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/menus', menuRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/qr', qrRouter);

app.use('/themes', themeRouter);
app.use('/temalar', temalarRouter);
app.use('/onizleme', onizlemeRouter);
app.use('/odeme', odemeRouter);
app.use('/admin', adminRouter);
app.use('/m', publicMenuRouter);
app.use('/preview', previewRouter);
app.use('/pay', fakepayRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhooks', checkoutRouter);
app.use('/checkout', checkoutRouter);

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 QR Menü çalışıyor → ${env.APP_URL} (port ${PORT}) [${env.NODE_ENV}]`);
});

export default app;
