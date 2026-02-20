import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createMenuSchema: z.ZodObject<{
    themeId: z.ZodString;
    businessName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    themeId: string;
    businessName?: string | undefined;
}, {
    themeId: string;
    businessName?: string | undefined;
}>;
export declare const categoryCreateSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const categoryUpdateSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const categoryReorderSchema: z.ZodObject<{
    orderedIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    orderedIds: string[];
}, {
    orderedIds: string[];
}>;
export declare const productCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    price: z.ZodString;
    categoryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    price: string;
    categoryId: string;
}, {
    name: string;
    price: string;
    categoryId: string;
    description?: string | undefined;
}>;
export declare const productUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    price?: string | undefined;
    categoryId?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    price?: string | undefined;
    categoryId?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map