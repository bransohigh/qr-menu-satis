import { Category, Menu, Product, Theme } from '@prisma/client';
export interface BrandKit {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
}
export interface ThemeData {
    menu: Menu & {
        theme: Theme;
        categories: Category[];
        products: Product[];
    };
    categories: Category[];
    productsByCategory: Record<string, Product[]>;
    brand?: BrandKit;
}
export declare function renderTheme(templateKey: string, data: ThemeData): string;
//# sourceMappingURL=index.d.ts.map