/**
 * Türkçe demo veri seti — önizleme sayfaları için (DB erişimi gerektirmez).
 * /onizleme/:temaSlug/* rotaları bu veriyi kullanır.
 */
export interface DemoUrun {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    imageUrl: string | null;
    gallery: string[];
    etiketler: string[];
    views: number;
    categoryId: string;
    menuId: string;
    createdAt: Date;
    category: {
        id: string;
        name: string;
        slug: string;
        sortOrder: number;
        menuId: string;
        createdAt: Date;
    };
}
export interface DemoKategori {
    id: string;
    name: string;
    slug: string;
    emoji: string;
    sortOrder: number;
    menuId: string;
    createdAt: Date;
}
export interface DemoMenu {
    id: string;
    slug: string;
    businessName: string;
    aciklama: string;
    userId: string;
    themeId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MENU_ID = "demo-menu-tr";
export declare const DEMO_KATEGORILER: DemoKategori[];
export declare const DEMO_URUNLER: DemoUrun[];
export declare function buildDemoMenuTR(temaSlug: string, temaAdi: string): DemoMenu;
export declare const TEMA_PREVIEW_IMAGES: Record<string, string>;
//# sourceMappingURL=demoMenuTR.d.ts.map