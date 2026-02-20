"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productUpdateSchema = exports.productCreateSchema = exports.categoryReorderSchema = exports.categoryUpdateSchema = exports.categoryCreateSchema = exports.createMenuSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.createMenuSchema = zod_1.z.object({
    themeId: zod_1.z.string().min(1, 'Theme ID is required'),
    businessName: zod_1.z.string().max(100).optional(),
});
exports.categoryCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
});
exports.categoryUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
});
exports.categoryReorderSchema = zod_1.z.object({
    orderedIds: zod_1.z.array(zod_1.z.string()).min(1, 'At least one ID required'),
});
exports.productCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(200),
    description: zod_1.z.string().max(1000).optional().default(''),
    price: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
    categoryId: zod_1.z.string().min(1, 'Category ID is required'),
});
exports.productUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    price: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    categoryId: zod_1.z.string().optional(),
});
//# sourceMappingURL=schemas.js.map