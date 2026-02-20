# QR Menü SaaS

Türkçe dijital menü platformu. Restoranlar bir tema seçer, kategorilerini ve ürünlerini ekler, QR kodunu müşterilerine paylaşır.

---

## Özellikler

- **10 farklı tema** — klasik liste, kart düzeni, minimal, gece modu, kapaklı, sol menü, kategori şeridi, görsel odaklı, kompakt, premium
- **Admin paneli** — kategori ve ürün yönetimi (görsel yükleme dahil)
- **Canlı önizleme** — `/onizleme/:temaSlug` ile her tema navigasyonlu demo ile görülebilir
- **QR kod oluşturma** — hazır baskı QR kodu indirilebilir
- **JWT auth** — httpOnly cookie oturumu
- **Ödeme simülasyonu** — `/odeme/simule` akışı

---

## Teknoloji Yığını

| Katman       | Teknoloji                              |
|--------------|----------------------------------------|
| Sunucu       | Node.js + Express + TypeScript         |
| Veritabanı   | PostgreSQL + Prisma ORM                |
| Prod DB      | Supabase PostgreSQL                    |
| Doğrulama    | Zod                                    |
| Auth         | JWT (httpOnly cookie)                  |
| Görüntüler   | Multer → `/uploads/` klasörü           |
| Şablonlar    | EJS                                    |
| Güvenlik     | Helmet, express-rate-limit             |
| Hosting      | Hostinger (Node.js)                    |

---

## Lokal Geliştirme

### 1. Gereksinimler

- Node.js 20+ LTS
- PostgreSQL 14+ (lokal)

### 2. Kur & Çalıştır

```bash
git clone https://github.com/bransohigh/qr-menu-satis.git
cd qr-menu-satis
npm install
```

### 3. Ortam Değişkenleri

```bash
cp .env.example .env
# .env dosyasını düzenle — DATABASE_URL ve JWT_SECRET zorunlu
```

### 4. Veritabanı

```bash
npm run prisma:generate   # Prisma istemcisini oluştur
npx prisma migrate dev    # Tabloları oluştur
npm run prisma:seed       # 10 temayı ve demo kullanıcıyı ekle
```

### 5. Geliştirme Sunucusu

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000) — `/temalar` sayfasına yönlendirilirsiniz.

**Demo hesabı:** `demo@qrmenu.app` / `demo1234`

---

## 🚀 Canlıya Alma — Supabase + Hostinger

### Adım 1 — Supabase Veritabanı Kurulumu

1. [supabase.com](https://supabase.com) → yeni proje oluşturun
2. **Project Settings → Database → Connection String** sayfasına gidin
3. İki farklı bağlantı dizesi kopyalayın:

| Değişken | Açıklama | Port |
|----------|----------|------|
| `DATABASE_URL` | Uygulama runtime bağlantısı (**Transaction mode / pooler**) | **6543** |
| `DIRECT_URL` | Prisma migrate/seed için **direkt** bağlantı | **5432** |

> ⚠️ `DATABASE_URL`'e `?pgbouncer=true` parametresini ekleyin (pooler için zorunlu).

### Adım 2 — Migrasyonları Çalıştır

Yerel makinenizde (ilk seferlik, Supabase'i hedefleyerek):

```bash
# DIRECT_URL'yi Supabase bağlantısı ile .env'e girin
npx prisma migrate deploy   # veya: npm run prisma:migrate
npm run prisma:seed          # Varsayılan temaları ve demo kullanıcıyı ekle
```

### Adım 3 — Hostinger Node.js Hosting Ayarları

1. **Hostinger Hepanel → Hosting → Web Siteleri → Node.js App** sekmesine gidin
2. Uygulama kök dizinini ve giriş noktasını ayarlayın (`dist/src/server/app.js`)
3. **Ortam Değişkenleri (Environment Variables)** bölümüne girin:

```
NODE_ENV=production
PORT=3000
APP_URL=https://alanadi.com
DATABASE_URL=postgresql://postgres.PROJE:SIFRE@aws-....supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.PROJE:SIFRE@aws-....supabase.com:5432/postgres
JWT_SECRET=<openssl rand -hex 32 ile üretilmiş değer>
COOKIE_NAME=oturum
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=5
TRUST_PROXY=true
PAYMENT_PROVIDER=fakepay
```

### Adım 4 — Build ve Deploy

```bash
# Yerel: TypeScript'i derle
npm run build

# dist/ klasörünü Hostinger'a yükle (FTP, Git veya Hostinger File Manager)
# Ardından Hostinger panelinden:
npm install --production
npm run prisma:generate
npm start
```

Veya tek komutla (Hostinger startup command'a yazın):

```bash
npm run deploy
# eşdeğeri: npm run prisma:generate && npm run prisma:migrate && npm start
```

### Adım 5 — Healthcheck Kontrolü

Yayınlandıktan sonra:

```bash
curl https://alanadi.com/saglik
# → {"durum":"ok","ortam":"production","zaman":"..."}
```

---

## Rotalar

| Method | Yol | Açıklama |
|--------|-----|----------|
| GET | `/` | → `/temalar` yönlendir |
| GET | `/temalar` | Tema galerisi |
| GET | `/temalar/:slug` | Tema detayı + satın al |
| GET | `/onizleme/:slug` | Canlı tema önizleme |
| GET | `/onizleme/:slug/k/:kat` | Kategori önizleme |
| GET | `/onizleme/:slug/u/:urun` | Ürün detay önizleme |
| GET | `/odeme/simule` | Ödeme simülasyonu |
| POST | `/api/auth/register` | Kayıt |
| POST | `/api/auth/login` | Giriş |
| POST | `/api/auth/logout` | Çıkış |
| GET | `/admin` | Yönetim paneli |
| GET | `/m/:slug` | Herkese açık menü |
| GET | `/saglik` | Healthcheck |

---

## Temalar

| Key | Ad | Düzen |
|-----|----|-------|
| `tema_01` | Klasik Liste | Geleneksel liste |
| `tema_02` | Kart Düzeni | Büyük görsel kartlar |
| `tema_03` | Minimal | Tipografi odaklı |
| `tema_04` | Gece Modu | Koyu zemin, neon aksanlar |
| `tema_05` | Kapaklı | Hero banner + sekmeli navigasyon |
| `tema_06` | Sol Menü | Sabit sol sidebar |
| `tema_07` | Kategori Şeridi | Yapışkan pill şeridi |
| `tema_08` | Görsel Odaklı | Tam kaplayan görseller |
| `tema_09` | Kompakt | Yoğun liste düzeni |
| `tema_10` | Premium | Glassmorphism + gradient |

---

## Proje Yapısı

```
/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   ├── seed.ts                # 10 tema + demo kullanıcı
│   └── migrations/
├── src/
│   └── server/
│       ├── app.ts             # Express giriş noktası
│       ├── config/
│       │   └── env.ts         # Zod ile ENV doğrulama
│       ├── middleware/
│       │   ├── auth.ts        # JWT middleware
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── temalar.ts     # /temalar
│       │   ├── onizleme.ts    # /onizleme
│       │   ├── odeme.ts       # /odeme
│       │   ├── admin.ts
│       │   ├── auth.ts
│       │   ├── publicMenu.ts
│       │   └── ...
│       ├── data/
│       │   └── demoMenuTR.ts  # 46 demo ürün, Unsplash görselleri
│       └── services/
│           └── prisma.ts
├── src/views/                 # EJS şablonları
├── uploads/                   # Yüklenen görseller (git'e eklenmez)
├── public/
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Notlar

- **Görseller:** Ürün görselleri `uploads/` klasörüne kaydedilir. Üretimde Hostinger'ın persistent storage'ı kullanılır. Ölçekleme için S3 / Cloudflare R2'ye geçin.
- **Tek menü:** Kullanıcı başına bir menü (MVP kısıtı, kolayca genişletilebilir).
- **Ödeme:** `fakepay` simülasyon modunda çalışır; gerçek ödeme için Stripe/İyzico entegrasyonu ekleyin.

