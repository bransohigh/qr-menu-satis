import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const themes = [
  {
    name: 'Köy Kahvaltısı',
    slug: 'koy-kahvaltisi',
    templateKey: 'tema_01',
    previewImage: '/previews/tema_01.svg',
    description: 'Sıcak amber tonları ve serif tipografi. Geleneksel lezzetlere yakışan rustik, davetkar tasarım.',
    price: 299, currency: 'TRY',
    features: ['Rustik amber tema', 'Serif başlıklar', 'Görsel-sol düzen', 'Sıcak arka plan', 'Mobil uyumlu'],
  },
  {
    name: 'Vegan Minimal',
    slug: 'vegan-minimal',
    templateKey: 'tema_02',
    previewImage: '/previews/tema_02.svg',
    description: 'Saf beyaz zemin, parlak yeşil vurgular. Sağlıklı ve çevre dostu mekanlar için temiz tasarım.',
    price: 299, currency: 'TRY',
    features: ['Beyaz-yeşil palet', 'Yuvarlak görseller', 'Pill navigasyon', 'Minimalist boşluk', 'Hızlı yükleme'],
  },
  {
    name: 'Sushi Kartlar',
    slug: 'sushi-kartlar',
    templateKey: 'tema_03',
    previewImage: '/previews/tema_03.svg',
    description: 'Koyu zemin, indigo aksanlar ve kartlı grid yapısı. Asya mutfaklarına özel asil görünüm.',
    price: 399, currency: 'TRY',
    features: ['Koyu arka plan', 'Indigo vurgular', '2 sütun kart grid', 'Sağ fiyat hizalama', 'OLED optimize'],
  },
  {
    name: 'Premium Koyu',
    slug: 'premium-koyu',
    templateKey: 'tema_04',
    previewImage: '/previews/tema_04.svg',
    description: 'Derin siyah zemin, glassmorphism kartlar ve mor gradient vurgular. Lüks restoranlar için.',
    price: 599, currency: 'TRY',
    features: ['Glassmorphism', 'Mor gradient', 'Parlaklık efektleri', 'Premium tipografi', 'Öncelikli destek'],
  },
  {
    name: 'Bistro Editoryal',
    slug: 'bistro-editoryal',
    templateKey: 'tema_05',
    previewImage: '/previews/tema_05.svg',
    description: 'Siyah-beyaz editoryal tipografi, gazete stili düzen. Şehir bisttroları için rafine seçim.',
    price: 349, currency: 'TRY',
    features: ['Editoryal düzen', 'Serif manşetler', 'Sağ fiyat', 'Yoğun satır düzeni', 'Monokrom estetik'],
  },
  {
    name: 'Modern Galeri',
    slug: 'modern-galeri',
    templateKey: 'tema_06',
    previewImage: '/previews/tema_06.svg',
    description: 'Gökyüzü mavisi vurgular, geniş hero ve galeri tarzı ürün grid. Cafe ve modern mekanlar için.',
    price: 349, currency: 'TRY',
    features: ['Hero banner', 'Sky mavi vurgular', 'Galeri grid', 'Geniş kart tasarımı', 'Animasyonlar'],
  },
  // ── Yeni Temalar (tema_11 – tema_16) ───────────────────────────────────────
  {
    name: 'Restoran Premium',
    slug: 'restoran-premium',
    templateKey: 'tema_11',
    previewImage: '/previews/tema_11.svg',
    description: 'Lüks koyu zemin, gül rengi vurgular ve glassmorphism kartlar. Premium restoranlar için.',
    price: 599, currency: 'TRY',
    features: ['Glassmorphism', 'Gül vurgular', 'Koyu premium zemin', 'Özel tipografi', 'Öncelikli destek'],
  },
  {
    name: 'Kafe Minimal',
    slug: 'kafe-minimal',
    templateKey: 'tema_12',
    previewImage: '/previews/tema_12.svg',
    description: 'Sade bej-taş tonları ve minimal kafe tasarımı. Sessiz, şık ve kullanıcı dostu.',
    price: 299, currency: 'TRY',
    features: ['Bej-taş palet', 'Minimalist boşluk', 'Pill navigasyon', 'Beyaz temiz zemin', 'Hızlı yükleme'],
  },
  {
    name: 'Sushi Kartlar Pro',
    slug: 'sushi-pro',
    templateKey: 'tema_13',
    previewImage: '/previews/tema_13.svg',
    description: 'Asya estetiği, kırmızı vurgular ve koyu kartlı grid düzeni. Suşi ve Asya restoranları için.',
    price: 399, currency: 'TRY',
    features: ['Kırmızı aksanlar', 'Koyu kart grid', '2 sütun düzen', 'Asya estetiği', 'OLED optimize'],
  },
  {
    name: 'Köy Büfesi',
    slug: 'koy-bufesi',
    templateKey: 'tema_14',
    previewImage: '/previews/tema_14.svg',
    description: 'Turuncu kasaba dokunuşları ve rustik sıcaklık. Köy büfesi ve geleneksel mutfaklar için.',
    price: 299, currency: 'TRY',
    features: ['Turuncu-kahve palet', 'Rustik tipografi', 'Görsel-sol düzen', 'Sıcak atmosfer', 'Mobil uyumlu'],
  },
  {
    name: 'Pastane Şık',
    slug: 'pastane-sik',
    templateKey: 'tema_15',
    previewImage: '/previews/tema_15.svg',
    description: 'Pembe pastel vurgular ve editoryal şıklık. Pastaneler, kafeler ve tatlı mekanlar için.',
    price: 349, currency: 'TRY',
    features: ['Pembe pastel', 'Editoryal düzen', 'Serif başlıklar', 'Şık monokrom', 'Zarafet'],
  },
  {
    name: 'Burger Modern',
    slug: 'burger-modern',
    templateKey: 'tema_16',
    previewImage: '/previews/tema_16.svg',
    description: 'Sarı enerjik vurgular ve galeri grid düzeni. Burger restoranları ve fast food mekanları için.',
    price: 349, currency: 'TRY',
    features: ['Sarı vurgular', 'Galeri grid', 'Hero banner', 'Enerjik tasarım', 'Animasyonlar'],
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
    { name: 'Çorbalar',      slug: 'corbalar',       sortOrder: 0 },
    { name: 'Başlangıçlar',  slug: 'baslangiclar',   sortOrder: 1 },
    { name: 'Ana Yemekler',  slug: 'ana-yemekler',   sortOrder: 2 },
    { name: 'Pizzalar',      slug: 'pizzalar',        sortOrder: 3 },
    { name: 'Salatalar',     slug: 'salatalar',       sortOrder: 4 },
    { name: 'Tatlılar',      slug: 'tatlilar',        sortOrder: 5 },
    { name: 'Sıcak İçecekler', slug: 'sicak-icecekler', sortOrder: 6 },
    { name: 'Soğuk İçecekler', slug: 'soguk-icecekler', sortOrder: 7 },
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
    // Çorbalar (8 ürün)
    { katSlug: 'corbalar', name: 'Mercimek Çorbası', slug: 'mercimek-corbasi', desc: 'Klasik Türk mercimek çorbası, tereyağı ve limonlu.', price: '45.00' },
    { katSlug: 'corbalar', name: 'Günlük Sebze Çorbası', slug: 'gunluk-sebze-corbasi', desc: 'Taze mevsim sebzeleri ve baharatlarla hazırlanır.', price: '45.00' },
    { katSlug: 'corbalar', name: 'Domates Çorbası', slug: 'domates-corbasi', desc: 'Olgun domates, fesleğen ve krema. Çıtır ekmek ile.', price: '50.00' },
    { katSlug: 'corbalar', name: 'Tarhana Çorbası', slug: 'tarhana-corbasi', desc: 'Ev yapımı tarhana tozu, nane ve kırmızı biber.', price: '45.00' },
    { katSlug: 'corbalar', name: 'Ezogelin Çorbası', slug: 'ezogelin-corbasi', desc: 'Bulgur, nane, kırmızı biber ve limon eşliğinde.', price: '45.00' },
    { katSlug: 'corbalar', name: 'Tavuk Suyu Çorbası', slug: 'tavuk-suyu-corbasi', desc: 'Ev yapımı tavuk suyu, şehriye ve havuç.', price: '55.00' },
    { katSlug: 'corbalar', name: 'Kremalı Mantar Çorbası', slug: 'kremali-mantar-corbasi', desc: 'Taze mantar, krema ve kekik. Klasik lezzet.', price: '60.00' },
    { katSlug: 'corbalar', name: 'İşkembe Çorbası', slug: 'iskembe-corbasi', desc: 'Geleneksel İşkembe çorbası, sarımsak ve sirke ile.', price: '65.00' },
    // Başlangıçlar (10 ürün)
    { katSlug: 'baslangiclar', name: 'Humus', slug: 'humus', desc: 'Nohut ezmesi, zeytinyağı ve susamlı tahini sos.', price: '65.00' },
    { katSlug: 'baslangiclar', name: 'Patlıcan Salatası', slug: 'patlican-salatasi', desc: 'Közlenmiş patlıcan, sarımsak ve zeytinyağı.', price: '70.00' },
    { katSlug: 'baslangiclar', name: 'Peynir Tabağı', slug: 'peynir-tabagi', desc: 'Mevsim peynirleri ve şarküteri seçkisi, bal ile.', price: '95.00' },
    { katSlug: 'baslangiclar', name: 'Sigara Böreği', slug: 'sigara-boregi', desc: 'Çıtır hamurda beyaz peynirli börek, 4 adet.', price: '55.00' },
    { katSlug: 'baslangiclar', name: 'Mantar Sote', slug: 'mantar-sote', desc: 'Tereyağlı mantar sote, sarımsak ve kekikli.', price: '80.00' },
    { katSlug: 'baslangiclar', name: 'Karides Kokteyl', slug: 'karides-kokteyl', desc: 'Taze karides, avokado, salata ve kokteyl sos.', price: '120.00' },
    { katSlug: 'baslangiclar', name: 'Bruschetta', slug: 'bruschetta', desc: 'Fırınlanmış ekmek, domates, sarımsak ve fesleğen.', price: '65.00' },
    { katSlug: 'baslangiclar', name: 'Meze Tabağı', slug: 'meze-tabagi', desc: 'Mevsim mezeleri seçkisi (5 çeşit), pide ile.', price: '110.00' },
    { katSlug: 'baslangiclar', name: 'Falafel', slug: 'falafel', desc: 'Nohut ve otlar ile yapılan kızarmış köfte, tahin sos ile.', price: '75.00' },
    { katSlug: 'baslangiclar', name: 'Zeytin Tabağı', slug: 'zeytin-tabagi', desc: 'Karışık zeytin, baharatlı yağ ve çıtır ekmek.', price: '50.00' },
    // Ana Yemekler (10 ürün)
    { katSlug: 'ana-yemekler', name: 'Izgara Köfte', slug: 'izgara-kofte', desc: 'El yapımı ızgara köfte, sebze garnitürü ile.', price: '185.00' },
    { katSlug: 'ana-yemekler', name: 'Tavuk Şiş', slug: 'tavuk-sis', desc: 'Marine edilmiş tavuk şiş, pilav ve salata.', price: '175.00' },
    { katSlug: 'ana-yemekler', name: 'Kuzu But', slug: 'kuzu-but', desc: 'Fırın kuzu but, baharatlı patates ile.', price: '280.00' },
    { katSlug: 'ana-yemekler', name: 'Levrek Izgara', slug: 'levrek-izgara', desc: 'Günlük taze levrek, ızgara, limonlu.', price: '320.00' },
    { katSlug: 'ana-yemekler', name: 'Makarna Bolonez', slug: 'makarna-bolonez', desc: 'Taze bolonez soslu spagetti, rendelenmiş parmesan.', price: '145.00' },
    { katSlug: 'ana-yemekler', name: 'Vejeteryan Burger', slug: 'vejeteryan-burger', desc: 'Nohut patatesi, avokado ve turşu ile dolu.', price: '155.00' },
    { katSlug: 'ana-yemekler', name: 'Kıymalı Pide', slug: 'kiymali-pide', desc: 'Kıyma, biber ve domates dolgulu geleneksel pide.', price: '160.00' },
    { katSlug: 'ana-yemekler', name: 'Lahmacun', slug: 'lahmacun', desc: 'İnce hamurlu kıymalı lahmacun, maydanoz ve limon.', price: '120.00' },
    { katSlug: 'ana-yemekler', name: 'Tavuk Sote', slug: 'tavuk-sote', desc: 'Domates ve biber soslu tavuk sote, taze ekmek ile.', price: '165.00' },
    { katSlug: 'ana-yemekler', name: 'Karışık Izgara', slug: 'karisik-izgara', desc: 'Köfte, tavuk şiş ve kanat: üç lezzetin ızgarası.', price: '245.00' },
    // Pizzalar (8 ürün)
    { katSlug: 'pizzalar', name: 'Karışık Pizza', slug: 'karisik-pizza', desc: 'Domates, peynir, mantar, sosis ve biber.', price: '195.00' },
    { katSlug: 'pizzalar', name: 'Margarita', slug: 'margarita', desc: 'Domates sosu, taze mozzarella ve fesleğen.', price: '165.00' },
    { katSlug: 'pizzalar', name: 'Pepperoni', slug: 'pepperoni', desc: 'Bol pepperoni ve mozzarella, baharatlı sos.', price: '185.00' },
    { katSlug: 'pizzalar', name: 'BBQ Tavuk Pizza', slug: 'bbq-tavuk-pizza', desc: 'Barbekü soslu tavuk, kırmızı soğan ve mısır.', price: '195.00' },
    { katSlug: 'pizzalar', name: 'Vejeteryan Pizza', slug: 'vejeteryan-pizza', desc: 'Mevsim sebzeleri, zeytinler, mantar ve brokoli.', price: '175.00' },
    { katSlug: 'pizzalar', name: 'Dört Peynirli', slug: 'dort-peynirli', desc: 'Mozzarella, gouda, cheddar ve parmesan.', price: '210.00' },
    { katSlug: 'pizzalar', name: 'Prosciutto Pizza', slug: 'prosciutto-pizza', desc: 'İnce dilim Parma jambonu, roka ve kiraz domates.', price: '225.00' },
    { katSlug: 'pizzalar', name: 'Ton Balıklı Pizza', slug: 'ton-balikli-pizza', desc: 'Ton balığı, soğan, mısır ve kapari ile.', price: '185.00' },
    // Salatalar (8 ürün)
    { katSlug: 'salatalar', name: 'Çoban Salatası', slug: 'coban-salatasi', desc: 'Domates, salatalık, biber, soğan ve maydanoz.', price: '65.00' },
    { katSlug: 'salatalar', name: 'Sezar Salatası', slug: 'sezar-salatasi', desc: 'Marul, crouton, parmesan ve sezar sos.', price: '95.00' },
    { katSlug: 'salatalar', name: 'Akdeniz Salatası', slug: 'akdeniz-salatasi', desc: 'Roka, kiraz domates, taze peynir ve siyah zeytin.', price: '90.00' },
    { katSlug: 'salatalar', name: 'Izgara Tavuklu Salata', slug: 'izgara-tavuklu-salata', desc: 'Izgara tavuk, mevsim yeşillikleri ve dijon sos.', price: '115.00' },
    { katSlug: 'salatalar', name: 'Ton Balıklı Salata', slug: 'ton-balikli-salata', desc: 'Ton balığı, mısır, zeytin ve marul.', price: '105.00' },
    { katSlug: 'salatalar', name: 'Yeşil Salata', slug: 'yesil-salata', desc: 'Mevsim yeşillikleri, çeşitli soslar ile servis edilir.', price: '70.00' },
    { katSlug: 'salatalar', name: 'Avokado Salatası', slug: 'avokado-salatasi', desc: 'Avokado, kiraz domates, roka ve limon sos.', price: '110.00' },
    { katSlug: 'salatalar', name: 'Quinoa Salatası', slug: 'quinoa-salatasi', desc: 'Quinoa, nar tanesi, nane ve nar ekşisi.', price: '105.00' },
    // Tatlılar (9 ürün)
    { katSlug: 'tatlilar', name: 'Sufle', slug: 'sufle', desc: 'Sıcak çikolatalı sufle, vanilyalı dondurma ile.', price: '95.00' },
    { katSlug: 'tatlilar', name: 'Tiramisu', slug: 'tiramisu', desc: 'Klasik İtalyan tiramisu, porselen kâsede sunulur.', price: '90.00' },
    { katSlug: 'tatlilar', name: 'Baklava', slug: 'baklava', desc: 'Antep fıstıklı geleneksel baklava, 4 dilim.', price: '85.00' },
    { katSlug: 'tatlilar', name: 'Dondurma', slug: 'dondurma', desc: 'Günlük 3 top dondurma, seçimli tatlar.', price: '65.00' },
    { katSlug: 'tatlilar', name: 'Cheesecake', slug: 'cheesecake', desc: 'Frambuaz soslu ev yapımı New York cheesecake.', price: '85.00' },
    { katSlug: 'tatlilar', name: 'Sütlaç', slug: 'sutlac', desc: 'Fırında pişmiş geleneksel sütlaç, tarçın ile.', price: '70.00' },
    { katSlug: 'tatlilar', name: 'Kazandibi', slug: 'kazandibi', desc: 'Hafif yanık, karamelimsi tavuk göğsü tatlısı.', price: '70.00' },
    { katSlug: 'tatlilar', name: 'Profiterol', slug: 'profiterol', desc: 'Kremalı profiterol, bol çikolata sos ile.', price: '90.00' },
    { katSlug: 'tatlilar', name: 'Güllaç', slug: 'gullac', desc: 'Ramazan geleneği: güllaç, gül suyu ve fıstık.', price: '80.00' },
    // Sıcak İçecekler (8 ürün)
    { katSlug: 'sicak-icecekler', name: 'Türk Çayı', slug: 'turk-cayi', desc: 'Demleme Türk çayı, iki bardak servis.', price: '25.00' },
    { katSlug: 'sicak-icecekler', name: 'Türk Kahvesi', slug: 'turk-kahvesi', desc: 'Geleneksel pişim, lokum ile servis edilir.', price: '45.00' },
    { katSlug: 'sicak-icecekler', name: 'Espresso', slug: 'espresso', desc: 'Çift shot espresso, yoğun aroma.', price: '50.00' },
    { katSlug: 'sicak-icecekler', name: 'Latte', slug: 'latte', desc: 'Espresso ve buharda ısıtılmış köpüklü süt.', price: '75.00' },
    { katSlug: 'sicak-icecekler', name: 'Cappuccino', slug: 'cappuccino', desc: 'Espresso, buharlatılmış süt ve bol köpük.', price: '70.00' },
    { katSlug: 'sicak-icecekler', name: 'Filtre Kahve', slug: 'filtre-kahve', desc: 'Günlük taze çekilmiş filtre kahve.', price: '55.00' },
    { katSlug: 'sicak-icecekler', name: 'Bitki Çayı', slug: 'bitki-cayi', desc: 'Ihlamur, ıhlamur-zencefil veya nane-limon.', price: '35.00' },
    { katSlug: 'sicak-icecekler', name: 'Sıcak Çikolata', slug: 'sicak-cikolata', desc: 'Kremalı sıcak çikolata, tarçın ve marshmallow.', price: '75.00' },
    // Soğuk İçecekler (8 ürün)
    { katSlug: 'soguk-icecekler', name: 'Limonata', slug: 'limonata', desc: 'Taze sıkılmış limon, nane ve buzlu servis.', price: '55.00' },
    { katSlug: 'soguk-icecekler', name: 'Ice Latte', slug: 'ice-latte', desc: 'Soğuk demleme espresso, sütlü ve buzlu.', price: '80.00' },
    { katSlug: 'soguk-icecekler', name: 'Portakal Suyu', slug: 'portakal-suyu', desc: 'Taze sıkılmış portakal suyu, buzlu.', price: '65.00' },
    { katSlug: 'soguk-icecekler', name: 'Smoothie', slug: 'smoothie', desc: 'Muz, çilek ve yoğurtlu mevsim smoothie.', price: '85.00' },
    { katSlug: 'soguk-icecekler', name: 'Ayran', slug: 'ayran', desc: 'Köy tipi el yapımı tuzlu ayran.', price: '30.00' },
    { katSlug: 'soguk-icecekler', name: 'Kombucha', slug: 'kombucha', desc: 'Ev yapımı fermente kombucha, çeşitli tatlar.', price: '80.00' },
    { katSlug: 'soguk-icecekler', name: 'Gazlı Su', slug: 'gazli-su', desc: '330ml premium doğal maden suyu.', price: '30.00' },
    { katSlug: 'soguk-icecekler', name: 'Meyve Suyu', slug: 'meyve-suyu', desc: 'Vişne, elma veya şeftali (seçimlik).', price: '45.00' },
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
