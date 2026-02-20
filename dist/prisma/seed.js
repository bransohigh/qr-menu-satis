"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const themes = [
    {
        name: 'Klasik Liste',
        slug: 'klasik-liste',
        templateKey: 'tema_01',
        previewImage: '/public/previews/tema_01.svg',
        description: 'Klasik, sade liste düzeni. Her tür restoran için zamansız bir seçim.',
        price: 299, currency: 'TRY',
        features: ['Temiz liste düzeni', 'Kategori gruplandırma', 'Hızlı yükleme', 'Mobil uyumlu'],
    },
    {
        name: 'Kart Düzeni',
        slug: 'kart-duzen',
        templateKey: 'tema_02',
        previewImage: '/public/previews/tema_02.svg',
        description: 'Büyük görselli kart ızgarası, görsel menüler için mükemmel.',
        price: 349, currency: 'TRY',
        features: ['Kart ızgara düzeni', 'Görsel ağırlıklı', 'Kategori başlıkları', 'Hover efektleri'],
    },
    {
        name: 'Minimal',
        slug: 'minimal',
        templateKey: 'tema_03',
        previewImage: '/public/previews/tema_03.svg',
        description: 'Şık minimalist tasarım, tipografiyi ön plana çıkarır.',
        price: 299, currency: 'TRY',
        features: ['Minimalist tasarım', 'Tipografi odaklı', 'Çok dilli destek', 'Özelleştirilebilir font'],
    },
    {
        name: 'Gece Modu',
        slug: 'gece-modu',
        templateKey: 'tema_04',
        previewImage: '/public/previews/tema_04.svg',
        description: 'Modern koyu tema, neon aksanlarla çarpıcı bir görünüm.',
        price: 399, currency: 'TRY',
        features: ['Tam karanlık tema', 'Neon vurgu renkleri', 'Lüks görünüm', 'OLED optimize'],
    },
    {
        name: 'Kapaklı',
        slug: 'kapakli',
        templateKey: 'tema_05',
        previewImage: '/public/previews/tema_05.svg',
        description: 'Tam genişlik kapak görseli ve sekmeli kategori navigasyonu.',
        price: 399, currency: 'TRY',
        features: ['Tam genişlik hero', 'Sekme navigasyon', 'Etkileyici kapak', 'Kategori sekmeleri'],
    },
    {
        name: 'Sol Menü',
        slug: 'sol-menu',
        templateKey: 'tema_06',
        previewImage: '/public/previews/tema_06.svg',
        description: 'Sabit sol kenar çubuğu ile hızlı kategori navigasyonu.',
        price: 349, currency: 'TRY',
        features: ['Sabit kenar çubuğu', 'Hızlı navigasyon', 'Masaüstü optimize', 'Çift panel düzeni'],
    },
    {
        name: 'Kategori Şeridi',
        slug: 'kategori-seridi',
        templateKey: 'tema_07',
        previewImage: '/public/previews/tema_07.svg',
        description: 'Yapışkan pill şerit ile akıcı kategori geçişleri.',
        price: 349, currency: 'TRY',
        features: ['Yapışkan kategori şeridi', 'Pill navigasyon', 'Akıcı kaydırma', 'Renkli kategoriler'],
    },
    {
        name: 'Görsel Odaklı',
        slug: 'gorsel-odakli',
        templateKey: 'tema_08',
        previewImage: '/public/previews/tema_08.svg',
        description: 'Tam kaplayan görseller, yemeklerinizi öne çıkarır.',
        price: 449, currency: 'TRY',
        features: ['Tam ekran görüntüler', 'Fotoğraf galeri', 'Saydam metin katmanı', 'Görsel öncelikli'],
    },
    {
        name: 'Kompakt',
        slug: 'kompakt',
        templateKey: 'tema_09',
        previewImage: '/public/previews/tema_09.svg',
        description: 'Yüksek yoğunluklu kompakt liste, tek sayfada daha fazla ürün.',
        price: 249, currency: 'TRY',
        features: ['Yoğun kompakt düzen', 'Daha fazla ürün görünür', 'Tablo benzeri liste', 'Hızlı tarama'],
    },
    {
        name: 'Premium',
        slug: 'premium',
        templateKey: 'tema_10',
        previewImage: '/public/previews/tema_10.svg',
        description: 'Cam efektli lüks tasarım, premium hissiyat.',
        price: 599, currency: 'TRY',
        features: ['Glassmorphism kartlar', 'Gradient animasyonlar', 'Premium tipografi', 'Lüks görünüm', 'Öncelikli destek'],
    },
];
async function main() {
    console.log('🌱 Seeding database...');
    // Seed themes (templateKey veya eski format veya slug bazlı eşleşme)
    for (const theme of themes) {
        const oldTemplateKey = theme.templateKey.replace('tema_', 'theme_');
        const existing = await prisma.theme.findFirst({
            where: {
                OR: [
                    { templateKey: theme.templateKey },
                    { templateKey: oldTemplateKey },
                    { slug: theme.slug },
                ],
            },
        });
        if (existing) {
            await prisma.theme.update({
                where: { id: existing.id },
                data: {
                    name: theme.name, slug: theme.slug, templateKey: theme.templateKey,
                    description: theme.description, price: theme.price,
                    currency: theme.currency, features: theme.features,
                    previewImage: theme.previewImage,
                },
            });
        }
        else {
            await prisma.theme.create({ data: theme });
        }
    }
    console.log(`✅ Seeded ${themes.length} themes`);
    // ── Demo user + menu ─────────────────────────────────────────────────
    const demoEmail = 'demo@qrmenu.app';
    const demoPassword = 'demo1234';
    const passwordHash = await bcryptjs_1.default.hash(demoPassword, 12);
    const demoUser = await prisma.user.upsert({
        where: { email: demoEmail },
        update: {},
        create: { email: demoEmail, passwordHash },
    });
    const firstTheme = await prisma.theme.findFirst({ orderBy: { createdAt: 'asc' } });
    const demoMenu = await prisma.menu.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            themeId: firstTheme.id,
            slug: 'demo-bistro',
            businessName: 'Demo Bistro',
        },
    });
    console.log(`✅ Demo user: ${demoEmail} / ${demoPassword}`);
    console.log(`✅ Demo menu: http://localhost:3000/m/demo-bistro`);
    // ── Demo categories ───────────────────────────────────────────────────
    const categoryData = [
        { name: 'Starters', slug: 'starters', sortOrder: 0 },
        { name: 'Main Course', slug: 'main-course', sortOrder: 1 },
        { name: 'Desserts', slug: 'desserts', sortOrder: 2 },
        { name: 'Drinks', slug: 'drinks', sortOrder: 3 },
    ];
    const categories = {};
    for (const cat of categoryData) {
        const existing = await prisma.category.findFirst({
            where: { menuId: demoMenu.id, slug: cat.slug },
        });
        const record = existing ?? await prisma.category.create({
            data: { menuId: demoMenu.id, ...cat },
        });
        categories[cat.slug] = record;
    }
    console.log(`✅ Seeded ${categoryData.length} demo categories`);
    // ── Demo products ─────────────────────────────────────────────────────
    const productData = [
        // Starters
        { categorySlug: 'starters', name: 'Bruschetta', slug: 'bruschetta', description: 'Toasted bread topped with fresh tomatoes, garlic, and basil.', price: '7.50' },
        { categorySlug: 'starters', name: 'Soup of the Day', slug: 'soup-of-the-day', description: 'Ask your server for today\'s selection.', price: '5.00' },
        { categorySlug: 'starters', name: 'Crispy Calamari', slug: 'crispy-calamari', description: 'Lightly battered and served with lemon aioli.', price: '10.00' },
        // Mains
        { categorySlug: 'main-course', name: 'Grilled Salmon', slug: 'grilled-salmon', description: 'Atlantic salmon with seasonal vegetables and herb butter.', price: '22.00' },
        { categorySlug: 'main-course', name: 'Ribeye Steak', slug: 'ribeye-steak', description: '300g aged ribeye, chargrilled to your preference.', price: '32.00' },
        { categorySlug: 'main-course', name: 'Mushroom Risotto', slug: 'mushroom-risotto', description: 'Creamy Arborio rice with wild mushrooms and truffle oil.', price: '16.00' },
        // Desserts
        { categorySlug: 'desserts', name: 'Tiramisu', slug: 'tiramisu', description: 'Classic Italian dessert with espresso and mascarpone.', price: '8.00' },
        { categorySlug: 'desserts', name: 'Crème Brûlée', slug: 'creme-brulee', description: 'Vanilla custard with a caramelised sugar crust.', price: '7.50' },
        // Drinks
        { categorySlug: 'drinks', name: 'Lemonade', slug: 'lemonade', description: 'Fresh-squeezed with mint.', price: '4.00' },
        { categorySlug: 'drinks', name: 'Espresso', slug: 'espresso', description: 'Single or double shot of our house blend.', price: '3.00' },
    ];
    for (const p of productData) {
        const catId = categories[p.categorySlug].id;
        const existing = await prisma.product.findFirst({
            where: { menuId: demoMenu.id, slug: p.slug },
        });
        if (!existing) {
            await prisma.product.create({
                data: {
                    menuId: demoMenu.id,
                    categoryId: catId,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    price: p.price,
                },
            });
        }
    }
    console.log(`✅ Seeded ${productData.length} demo products`);
    console.log('🌱 Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map