/**
 * Fixed in-memory demo dataset used for theme preview pages.
 * Does NOT require any database access.
 * All preview routes (/preview/:themeSlug/...) use this data.
 */
export interface DemoProduct {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    imageUrl: string | null;
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
export interface DemoCategory {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    menuId: string;
    createdAt: Date;
}
export interface DemoMenu {
    id: string;
    slug: string;
    businessName: string;
    userId: string;
    themeId: string;
    createdAt: Date;
    updatedAt: Date;
    theme: {
        id: string;
        name: string;
        slug: string;
        templateKey: string;
        previewImage: string;
        description: string;
        createdAt: Date;
    };
    categories: DemoCategory[];
    products: DemoProduct[];
}
export declare const DEMO_CATEGORIES: DemoCategory[];
export declare const DEMO_PRODUCTS: DemoProduct[];
export declare function buildDemoMenu(themeSlug: string, themeName: string): DemoMenu;
//# sourceMappingURL=demoMenu.d.ts.map