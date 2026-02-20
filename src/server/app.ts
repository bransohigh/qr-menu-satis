import 'dotenv/config';
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
const PORT = process.env.PORT || 3000;

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
app.set('views', path.join(__dirname, '../views'));

// ─── Body parsing, cookies, logging ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ─── Static files ────────────────────────────────────────────────────────────
app.use('/public', express.static(path.join(__dirname, '../../public')));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

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
  console.log(`🚀 QR Menu SaaS running at http://localhost:${PORT}`);
});

export default app;
