/**
 * env.ts — Uygulama ortam değişkeni doğrulama ve merkezi konfigürasyon
 * Zod ile tüm ENV değişkenleri başlangıçta doğrulanır; eksik/hatalı
 * değişken varsa uygulama açılmadan hata verir.
 */
import { z } from 'zod';

const envSchema = z.object({
  // ── Temel ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // ── URL ────────────────────────────────────────────────────────────────
  APP_URL: z.string().url({ message: 'APP_URL geçerli bir URL olmalı (ör: https://alanadi.com)' }),

  // ── Veritabanı ─────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL zorunlu — Supabase connection string girin'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL zorunlu — Supabase direct connection string girin').optional(),

  // ── Güvenlik ───────────────────────────────────────────────────────────
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET en az 32 karakter olmalı'),

  // ── Cookie ─────────────────────────────────────────────────────────────
  COOKIE_NAME: z.string().default('oturum'),

  // ── Upload ─────────────────────────────────────────────────────────────
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.string().default('5').transform(Number),

  // ── Proxy ──────────────────────────────────────────────────────────────
  TRUST_PROXY: z.string().default('false').transform((v) => v === 'true' || v === '1'),

  // ── Ödeme (opsiyonel) ──────────────────────────────────────────────────
  PAYMENT_PROVIDER: z.enum(['fakepay', 'stripe', 'iyzico']).default('fakepay'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n❌ Ortam değişkeni hatası — uygulama başlatılamıyor:\n');
    for (const [field, errors] of Object.entries(
      result.error.flatten().fieldErrors
    )) {
      console.error(`  • ${field}: ${(errors as string[]).join(', ')}`);
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

export const env = validateEnv();

// Türetilmiş ayarlar
export const isProd = env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
} as const;
