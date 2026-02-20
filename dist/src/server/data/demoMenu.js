"use strict";
/**
 * Fixed in-memory demo dataset used for theme preview pages.
 * Does NOT require any database access.
 * All preview routes (/preview/:themeSlug/...) use this data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_PRODUCTS = exports.DEMO_CATEGORIES = void 0;
exports.buildDemoMenu = buildDemoMenu;
const MENU_ID = 'demo-menu';
exports.DEMO_CATEGORIES = [
    { id: 'cat-1', name: 'Başlangıçlar', slug: 'baslangiclar', sortOrder: 0, menuId: MENU_ID, createdAt: new Date() },
    { id: 'cat-2', name: 'Ana Yemekler', slug: 'ana-yemekler', sortOrder: 1, menuId: MENU_ID, createdAt: new Date() },
    { id: 'cat-3', name: 'Tatlılar', slug: 'tatlilar', sortOrder: 2, menuId: MENU_ID, createdAt: new Date() },
    { id: 'cat-4', name: 'İçecekler', slug: 'icecekler', sortOrder: 3, menuId: MENU_ID, createdAt: new Date() },
];
exports.DEMO_PRODUCTS = [
    // Başlangıçlar
    {
        id: 'p-1', categoryId: 'cat-1', menuId: MENU_ID,
        name: 'Bruschetta', slug: 'bruschetta',
        description: 'Taze domates, sarımsak ve fesleğen ile servis edilen kızarmış ekmek dilimleri. Zeytinyağı, tuz ve karabiber ile tatlandırılmış.',
        price: '8.50', imageUrl: null, views: 42, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[0],
    },
    {
        id: 'p-2', categoryId: 'cat-1', menuId: MENU_ID,
        name: 'Günün Çorbası', slug: 'gunun-corbasi',
        description: 'Şefimizin günlük hazırladığı mevsimlik çorba. Taze malzemelerle hazırlanır.',
        price: '5.50', imageUrl: null, views: 28, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[0],
    },
    {
        id: 'p-3', categoryId: 'cat-1', menuId: MENU_ID,
        name: 'Çıtır Kalamar', slug: 'citir-kalamar',
        description: 'Limon aioli ile servis edilen, hafifçe tatlandırılmış çıtır kalamar halkalar.',
        price: '12.00', imageUrl: null, views: 35, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[0],
    },
    // Ana Yemekler
    {
        id: 'p-4', categoryId: 'cat-2', menuId: MENU_ID,
        name: 'Izgara Somon', slug: 'izgara-somon',
        description: 'Mevsim sebzeleri ve otlu tereyağı ile servis edilen Atlantik somonu. Fırında hafifçe pişirilmiş.',
        price: '24.00', imageUrl: null, views: 67, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[1],
    },
    {
        id: 'p-5', categoryId: 'cat-2', menuId: MENU_ID,
        name: 'Ribeye Biftek', slug: 'ribeye-biftek',
        description: '300g olgunlaştırılmış ribeye biftek, ızgarada tercih ettiğiniz pişirme derecesinde hazırlanır.',
        price: '36.00', imageUrl: null, views: 89, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[1],
    },
    {
        id: 'p-6', categoryId: 'cat-2', menuId: MENU_ID,
        name: 'Mantar Risotto', slug: 'mantar-risotto',
        description: 'Yabani mantar ve truffle yağı ile hazırlanmış kremsi Arborio pirinci. Vejetaryen.',
        price: '18.00', imageUrl: null, views: 44, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[1],
    },
    // Tatlılar
    {
        id: 'p-7', categoryId: 'cat-3', menuId: MENU_ID,
        name: 'Tiramisu', slug: 'tiramisu',
        description: 'Espresso ve maskarpone peyniri ile hazırlanmış klasik İtalyan tatlısı.',
        price: '9.00', imageUrl: null, views: 56, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[2],
    },
    {
        id: 'p-8', categoryId: 'cat-3', menuId: MENU_ID,
        name: 'Crème Brûlée', slug: 'creme-brulee',
        description: 'Karamelize şeker kabuğu ile servis edilen vanilyalı muhallebi.',
        price: '8.50', imageUrl: null, views: 38, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[2],
    },
    // İçecekler
    {
        id: 'p-9', categoryId: 'cat-4', menuId: MENU_ID,
        name: 'Limonata', slug: 'limonata',
        description: 'Taze sıkılmış limon ve nane yaprakları ile hazırlanmış ferahlatıcı limonata.',
        price: '4.50', imageUrl: null, views: 91, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[3],
    },
    {
        id: 'p-10', categoryId: 'cat-4', menuId: MENU_ID,
        name: 'Espresso', slug: 'espresso',
        description: 'Ev karışımımızdan tek veya çift shot espresso.',
        price: '3.50', imageUrl: null, views: 102, createdAt: new Date(),
        category: exports.DEMO_CATEGORIES[3],
    },
];
// Fix nested category refs after array is declared
exports.DEMO_PRODUCTS.forEach(p => {
    const cat = exports.DEMO_CATEGORIES.find(c => c.id === p.categoryId);
    if (cat)
        p.category = cat;
});
function buildDemoMenu(themeSlug, themeName) {
    return {
        id: MENU_ID,
        slug: `preview-${themeSlug}`,
        businessName: 'Demo Bistro',
        userId: 'demo-user',
        themeId: 'demo-theme',
        createdAt: new Date(),
        updatedAt: new Date(),
        theme: {
            id: 'demo-theme', name: themeName, slug: themeSlug,
            templateKey: themeSlug, previewImage: `/public/previews/${themeSlug}.svg`,
            description: '', createdAt: new Date(),
        },
        categories: exports.DEMO_CATEGORIES,
        products: exports.DEMO_PRODUCTS,
    };
}
//# sourceMappingURL=demoMenu.js.map