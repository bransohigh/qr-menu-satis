"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = exports.isProd = exports.env = void 0;
/**
 * env.ts — Uygulama ortam değişkeni doğrulama ve merkezi konfigürasyon
 * Zod ile tüm ENV değişkenleri başlangıçta doğrulanır; eksik/hatalı
 * değişken varsa uygulama açılmadan hata verir.
 */
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    // ── Temel ──────────────────────────────────────────────────────────────
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3000').transform(Number),
    // ── URL ────────────────────────────────────────────────────────────────
    APP_URL: zod_1.z.string().url({ message: 'APP_URL geçerli bir URL olmalı (ör: https://alanadi.com)' }),
    // ── Veritabanı ─────────────────────────────────────────────────────────
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL zorunlu — Supabase connection string girin'),
    DIRECT_URL: zod_1.z.string().min(1, 'DIRECT_URL zorunlu — Supabase direct connection string girin').optional(),
    // ── Güvenlik ───────────────────────────────────────────────────────────
    JWT_SECRET: zod_1.z
        .string()
        .min(32, 'JWT_SECRET en az 32 karakter olmalı'),
    // ── Cookie ─────────────────────────────────────────────────────────────
    COOKIE_NAME: zod_1.z.string().default('oturum'),
    // ── Upload ─────────────────────────────────────────────────────────────
    UPLOAD_DIR: zod_1.z.string().default('uploads'),
    MAX_UPLOAD_MB: zod_1.z.string().default('5').transform(Number),
    // ── Proxy ──────────────────────────────────────────────────────────────
    TRUST_PROXY: zod_1.z.string().default('false').transform((v) => v === 'true' || v === '1'),
    // ── Ödeme (opsiyonel) ──────────────────────────────────────────────────
    PAYMENT_PROVIDER: zod_1.z.enum(['fakepay', 'stripe', 'iyzico']).default('fakepay'),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    IYZICO_API_KEY: zod_1.z.string().optional(),
    IYZICO_SECRET_KEY: zod_1.z.string().optional(),
});
function validateEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('\n❌ Ortam değişkeni hatası — uygulama başlatılamıyor:\n');
        for (const [field, errors] of Object.entries(result.error.flatten().fieldErrors)) {
            console.error(`  • ${field}: ${errors.join(', ')}`);
        }
        console.error('\n.env dosyanızı veya sunucu ENV ayarlarını kontrol edin.\n');
        process.exit(1);
    }
    const data = result.data;
    // DIRECT_URL yoksa DATABASE_URL'den devral (lokal geliştirme kolaylığı)
    if (!data.DIRECT_URL) {
        data.DIRECT_URL = data.DATABASE_URL;
        // Prisma process.env üzerinden okur; senkronize et
        process.env.DIRECT_URL = data.DATABASE_URL;
    }
    return data;
}
exports.env = validateEnv();
// Türetilmiş ayarlar
exports.isProd = exports.env.NODE_ENV === 'production';
exports.cookieOptions = {
    httpOnly: true,
    secure: exports.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
};
//# sourceMappingURL=env.js.map