# QR Menu SaaS

A production-ready QR code menu system. Restaurants pick a fixed theme, add their categories and products, and share the QR code with customers.

---

## Features

- **10 fixed beautiful themes** — customers cannot edit design, only content
- **Admin panel** — manage categories (with drag-drop reorder) and products (with image upload)
- **Public menu pages** — `/m/:slug` renders the chosen theme with live data
- **QR code generation** — download a ready-to-print QR code from the dashboard
- **JWT auth** — secure httpOnly cookie sessions

---

## Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Server       | Node.js + Express + TypeScript     |
| Database     | PostgreSQL + Prisma ORM            |
| Validation   | Zod                                |
| Auth         | JWT (httpOnly cookies)             |
| Images       | Multer → local `/uploads/` folder  |
| Views        | EJS templates                      |
| Security     | Helmet, express-rate-limit         |

---

## Quick Start

### 1. Prerequisites

- Node.js 20+ LTS
- PostgreSQL 14+ running locally

### 2. Clone & Install

```bash
git clone <repo-url>
cd qr-menu-website
npm install
```

### 3. Environment

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL and JWT_SECRET
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed 10 themes
npm run prisma:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/themes`.

---

## Routes

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/themes`                     | Theme gallery + account creation   |
| POST   | `/api/auth/register`          | Create account                     |
| POST   | `/api/auth/login`             | Login                              |
| POST   | `/api/auth/logout`            | Logout                             |
| GET    | `/api/auth/me`                | Current user info                  |
| POST   | `/api/menus/create-from-theme`| Create menu with selected theme    |
| GET    | `/admin`                      | Dashboard + QR code                |
| GET    | `/admin/categories`           | Category management                |
| GET    | `/admin/products`             | Product management                 |
| GET    | `/api/categories`             | List categories (API)              |
| POST   | `/api/categories`             | Create category                    |
| PATCH  | `/api/categories/reorder`     | Reorder categories                 |
| PATCH  | `/api/categories/:id`         | Rename category                    |
| DELETE | `/api/categories/:id`         | Delete category                    |
| GET    | `/api/products`               | List products (API)                |
| POST   | `/api/products`               | Create product (multipart)         |
| PATCH  | `/api/products/:id`           | Update product (multipart)         |
| DELETE | `/api/products/:id`           | Delete product                     |
| GET    | `/api/qr`                     | Download QR code PNG               |
| GET    | `/m/:slug`                    | Public menu page                   |

---

## Themes

| Key        | Name                  | Style                              |
|------------|-----------------------|------------------------------------|
| `theme_01` | Classic List          | Traditional table layout           |
| `theme_02` | Card Grid             | Cards with category headers        |
| `theme_03` | Minimal Typography    | Serif-based elegant design         |
| `theme_04` | Dark Mode             | Dark background, amber accents     |
| `theme_05` | Hero Sections         | Gradient hero banners per category |
| `theme_06` | Sidebar Navigation    | Fixed sidebar + content area       |
| `theme_07` | Floating Nav          | Sticky pill navigation             |
| `theme_08` | Image Focus           | Large product images               |
| `theme_09` | Compact Menu          | High-density dot-leader layout     |
| `theme_10` | Premium               | Tabbed dark luxury with animations |

---

## Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seeds 10 themes
├── src/
│   ├── server/
│   │   ├── app.ts          # Express app entry point
│   │   ├── middleware/
│   │   │   ├── auth.ts     # JWT middleware
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── themes.ts
│   │   │   ├── menus.ts
│   │   │   ├── categories.ts
│   │   │   ├── products.ts
│   │   │   ├── admin.ts
│   │   │   ├── publicMenu.ts
│   │   │   └── qr.ts
│   │   ├── services/
│   │   │   └── prisma.ts   # Prisma singleton
│   │   ├── themeRenderer/
│   │   │   └── index.ts    # 10 theme renderers
│   │   └── validators/
│   │       └── schemas.ts  # Zod schemas
│   └── views/
│       ├── themes/
│       │   └── index.ejs   # Theme gallery page
│       ├── admin/
│       │   ├── dashboard.ejs
│       │   ├── categories.ejs
│       │   └── products.ejs
│       └── partials/
│           ├── admin-nav.ejs
│           └── admin-styles.ejs
├── uploads/                # Uploaded product images (git-ignored)
├── public/                 # Static assets
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Notes

- **No payments** — MVP only creates menu, no billing logic
- **One menu per user** — MVP constraint; easy to extend later
- **Local uploads** — images stored in `/uploads/`. For production, migrate to S3/Cloudflare R2
- **Theme design** — NOT editable by customers. To add themes, add to `src/server/themeRenderer/index.ts`
