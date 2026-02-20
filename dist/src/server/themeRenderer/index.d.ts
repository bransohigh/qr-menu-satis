import { Category, Menu, Product, Theme } from '@prisma/client';
export interface ThemeData {
    menu: Menu & {
        theme: Theme;
        categories: Category[];
        products: Product[];
    };
    categories: Category[];
    productsByCategory: Record<string, Product[]>;
}
export declare function renderTheme(templateKey: string, data: ThemeData): string;
//# sourceMappingURL=index.d.ts.map