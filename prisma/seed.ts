import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
  console.log('🌱 Veritabanı seed başlatılıyor...');

  // ── Temalar ───────────────────────────────────────────────────────────────
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
    } else {
      await prisma.theme.create({ data: theme });
    }
  }
  console.log(`✅ ${themes.length} tema oluşturuldu/güncellendi`);

  const firstTheme = await prisma.theme.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!firstTheme) throw new Error('Tema bulunamadı!');

  // ── Süper Admin ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Demo12345!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: { role: 'ADMIN', passwordHash: adminHash },
    create: { email: 'admin@demo.local', passwordHash: adminHash, role: 'ADMIN' },
  });
  console.log(`✅ Süper Admin: admin@demo.local / Demo12345!  →  /yonetim`);

  // ── Demo Müşteri ──────────────────────────────────────────────────────────
  const musteriHash = await bcrypt.hash('Demo12345!', 12);
  const musteriUser = await prisma.user.upsert({
    where: { email: 'musteri@demo.local' },
    update: { role: 'MUSTERI', passwordHash: musteriHash },
    create: { email: 'musteri@demo.local', passwordHash: musteriHash, role: 'MUSTERI' },
  });
  console.log(`✅ Demo Müşteri: musteri@demo.local / Demo12345!  →  /panel`);

  // ── Demo Menü ─────────────────────────────────────────────────────────────
  const demoMenu = await prisma.menu.upsert({
    where: { userId: musteriUser.id },
    update: { businessName: 'Demo Kafe', themeId: firstTheme.id },
    create: {
      userId: musteriUser.id,
      themeId: firstTheme.id,
      slug: 'demo-kafe',
      businessName: 'Demo Kafe',
    },
  });
  console.log(`✅ Demo menü: /m/demo-kafe`);

  // ── Demo Satın Alım (ödendi) ──────────────────────────────────────────────
  const mevcutSatinAlim = await prisma.purchase.findFirst({
    where: { userId: musteriUser.id, status: 'paid' },
  });
  if (!mevcutSatinAlim) {
    await prisma.purchase.create({
      data: {
        userId: musteriUser.id,
        themeId: firstTheme.id,
        amount: firstTheme.price ?? 299,
        currency: firstTheme.currency ?? 'TRY',
        status: 'paid',
        provider: 'fakepay',
        providerRef: 'DEMO-SEED-001',
      },
    });
    console.log(`✅ Demo satın alım kaydı oluşturuldu (ödendi)`);
  } else {
    console.log(`ℹ️  Demo satın alım zaten mevcut`);
  }

  // ── Demo Kategoriler ──────────────────────────────────────────────────────
  const kategoriVerisi = [
    { name: 'Başlangıçlar',  slug: 'baslangiclar',  sortOrder: 0 },
    { name: 'Ana Yemekler',  slug: 'ana-yemekler',  sortOrder: 1 },
    { name: 'Pizzalar',      slug: 'pizzalar',       sortOrder: 2 },
    { name: 'Tatlılar',      slug: 'tatlilar',       sortOrder: 3 },
    { name: 'İçecekler',     slug: 'icecekler',      sortOrder: 4 },
    { name: 'Salatalar',     slug: 'salatalar',      sortOrder: 5 },
  ];

  const kategoriler: Record<string, string> = {};
  for (const kat of kategoriVerisi) {
    const mevcut = await prisma.category.findFirst({
      where: { menuId: demoMenu.id, slug: kat.slug },
    });
    const kayit = mevcut ?? await prisma.category.create({
      data: { menuId: demoMenu.id, ...kat },
    });
    kategoriler[kat.slug] = kayit.id;
  }
  console.log(`✅ ${kategoriVerisi.length} demo kategori oluşturuldu`);

  // ── Demo Ürünler ──────────────────────────────────────────────────────────
  const urunVerisi = [
    // Başlangıçlar (7 ürün)
    { katSlug: 'baslangiclar', name: 'Günlük Çorba', slug: 'gunluk-corba', desc: 'Günlük taze sebze çorbası.', price: '45.00' },
    { katSlug: 'baslangiclar', name: 'Mercimek Çorbası', slug: 'mercimek-corbasi', desc: 'Klasik Türk mercimek çorbası, limonlu.', price: '45.00' },
    { katSlug: 'baslangiclar', name: 'Humus', slug: 'humus', desc: 'Nohut ezmesi, zeytinyağı ve susamlı.', price: '65.00' },
    { katSlug: 'baslangiclar', name: 'Patlıcan Salatası', slug: 'patlican-salatasi', desc: 'Közlenmiş patlıcan, sarımsak ve zeytinyağı.', price: '70.00' },
    { katSlug: 'baslangiclar', name: 'Peynir Tabağı', slug: 'peynir-tabagi', desc: 'Mevsim peynirleri ve şarküteri seçkisi.', price: '95.00' },
    { katSlug: 'baslangiclar', name: 'Sigara Böreği', slug: 'sigara-boregi', desc: 'Çıtır hamurda beyaz peynirli börek.', price: '55.00' },
    { katSlug: 'baslangiclar', name: 'Mantar Sote', slug: 'mantar-sote', desc: 'Tereyağlı mantar sote, kekikli.', price: '80.00' },
    // Ana Yemekler (8 ürün)
    { katSlug: 'ana-yemekler', name: 'Izgara Köfte', slug: 'izgara-kofte', desc: 'El yapımı ızgara köfte, sebze garnitürü ile.', price: '185.00' },
    { katSlug: 'ana-yemekler', name: 'Tavuk Şiş', slug: 'tavuk-sis', desc: 'Marine edilmiş tavuk şiş, pilav ve salata.', price: '175.00' },
    { katSlug: 'ana-yemekler', name: 'Kuzu But', slug: 'kuzu-but', desc: 'Fırın kuzu but, baharatlı patates ile.', price: '280.00' },
    { katSlug: 'ana-yemekler', name: 'Levrek Izgara', slug: 'levrek-izgara', desc: 'Günlük taze levrek, ızgara, limonlu.', price: '320.00' },
    { katSlug: 'ana-yemekler', name: 'Makarna Bolonez', slug: 'makarna-bolonez', desc: 'Taze bolonez soslu spagetti.', price: '145.00' },
    { katSlug: 'ana-yemekler', name: 'Vejeteryan Burger', slug: 'vejeteryan-burger', desc: 'Nohut patatesi, avokado, turşu.', price: '155.00' },
    { katSlug: 'ana-yemekler', name: 'Kıymalı Pide', slug: 'kiymali-pide', desc: 'Kıyma, biber, domates dolgulu pide.', price: '160.00' },
    { katSlug: 'ana-yemekler', name: 'Lahmacun', slug: 'lahmacun', desc: 'İnce hamurlu kıymalı lahmacun, 2 adet.', price: '120.00' },
    // Pizzalar (6 ürün)
    { katSlug: 'pizzalar', name: 'Karışık Pizza', slug: 'karisik-pizza', desc: 'Domates, peynir, mantar, sosis, biber.', price: '195.00' },
    { katSlug: 'pizzalar', name: 'Margarita', slug: 'margarita', desc: 'Domates sosu, mozzarella, fesleğen.', price: '165.00' },
    { katSlug: 'pizzalar', name: 'Pepperoni', slug: 'pepperoni', desc: 'Bol pepperoni ve mozzarella.', price: '185.00' },
    { katSlug: 'pizzalar', name: 'BBQ Tavuk Pizza', slug: 'bbq-tavuk-pizza', desc: 'Barbekü soslu tavuk, kırmızı soğan.', price: '195.00' },
    { katSlug: 'pizzalar', name: 'Vejeteryan Pizza', slug: 'vejeteryan-pizza', desc: 'Mevsim sebzeleri, zeytinler, mantar.', price: '175.00' },
    { katSlug: 'pizzalar', name: 'Dört Peynirli', slug: 'dort-peynirli', desc: 'Mozzarella, gouda, cheddar, parmesan.', price: '210.00' },
    // Tatlılar (7 ürün)
    { katSlug: 'tatlilar', name: 'Sufle', slug: 'sufle', desc: 'Sıcak çikolatalı sufle, dondurma ile.', price: '95.00' },
    { katSlug: 'tatlilar', name: 'Tiramisu', slug: 'tiramisu', desc: 'Klasik İtalyan tiramisu, porselen kâsede.', price: '90.00' },
    { katSlug: 'tatlilar', name: 'Baklava', slug: 'baklava', desc: 'Antep fıstıklı baklava, 4 dilim.', price: '85.00' },
    { katSlug: 'tatlilar', name: 'Dondurma', slug: 'dondurma', desc: 'Günlük 3 top dondurma, seçimli tatlar.', price: '65.00' },
    { katSlug: 'tatlilar', name: 'Cheesecake', slug: 'cheesecake', desc: 'Frambuaz soslu ev yapımı cheesecake.', price: '85.00' },
    { katSlug: 'tatlilar', name: 'Sütlaç', slug: 'sutlac', desc: 'Fırında pişmiş geleneksel sütlaç.', price: '70.00' },
    { katSlug: 'tatlilar', name: 'Kazandibi', slug: 'kazandibi', desc: 'Yanık tavuk göğsü tatlısı.', price: '70.00' },
    // İçecekler (8 ürün)
    { katSlug: 'icecekler', name: 'Türk Çayı', slug: 'turk-cayi', desc: 'Demleme Türk çayı, iki bardak.', price: '25.00' },
    { katSlug: 'icecekler', name: 'Türk Kahvesi', slug: 'turk-kahvesi', desc: 'Geleneksel Türk kahvesi, lokum ile.', price: '45.00' },
    { katSlug: 'icecekler', name: 'Espresso', slug: 'espresso', desc: 'Çift shot espresso.', price: '50.00' },
    { katSlug: 'icecekler', name: 'Latte', slug: 'latte', desc: 'Espresso ve buharda ısıtılmış süt.', price: '75.00' },
    { katSlug: 'icecekler', name: 'Limonata', slug: 'limonata', desc: 'Taze sıkılmış üzüm limonata, naneli.', price: '55.00' },
    { katSlug: 'icecekler', name: 'Meyve Suyu', slug: 'meyve-suyu', desc: 'Portakal, elma veya vişne (seçimlik).', price: '45.00' },
    { katSlug: 'icecekler', name: 'Ayran', slug: 'ayran', desc: 'Köy tipi el yapımı ayran.', price: '30.00' },
    { katSlug: 'icecekler', name: 'Su', slug: 'su', desc: '500ml doğal kaynak suyu.', price: '15.00' },
    // Salatalar (6 ürün)
    { katSlug: 'salatalar', name: 'Çoban Salatası', slug: 'coban-salatasi', desc: 'Domates, salatalık, biber, maydanoz.', price: '65.00' },
    { katSlug: 'salatalar', name: 'Sezar Salatası', slug: 'sezar-salatasi', desc: 'Marul, crouton, parmesan, sezar sos.', price: '95.00' },
    { katSlug: 'salatalar', name: 'Akdeniz Salatası', slug: 'akdeniz-salatasi', desc: 'Roka, kiraz domates, taze peynir, zeytin.', price: '90.00' },
    { katSlug: 'salatalar', name: 'Izgara Tavuklu Salata', slug: 'izgara-tavuklu-salata', desc: 'Izgara tavuk, mevsim yeşillikleri.', price: '115.00' },
    { katSlug: 'salatalar', name: 'Ton Balıklı Salata', slug: 'ton-balikli-salata', desc: 'Ton balığı, mısır, zeytin, marul.', price: '105.00' },
    { katSlug: 'salatalar', name: 'Yeşil Salata', slug: 'yesil-salata', desc: 'Mevsim yeşillikleri, çeşitli soslar.', price: '70.00' },
  ];

  let urunSayisi = 0;
  for (const u of urunVerisi) {
    const katId = kategoriler[u.katSlug];
    if (!katId) continue;
    const mevcut = await prisma.product.findFirst({
      where: { menuId: demoMenu.id, slug: u.slug },
    });
    if (!mevcut) {
      await prisma.product.create({
        data: {
          menuId: demoMenu.id,
          categoryId: katId,
          name: u.name,
          slug: u.slug,
          description: u.desc,
          price: u.price,
        },
      });
      urunSayisi++;
    }
  }
  console.log(`✅ ${urunSayisi} yeni demo ürün eklendi (toplam: ${urunVerisi.length})`);

  console.log('');
  console.log('🎉 Seed tamamlandı!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Demo Hesaplar:');
  console.log('   Süper Admin : admin@demo.local   / Demo12345!  → /yonetim');
  console.log('   Demo Müşteri: musteri@demo.local / Demo12345!  → /panel');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed başarısız:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
