import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createMenuSchema = z.object({
  themeId: z.string().min(1, 'Theme ID is required'),
  businessName: z.string().max(100).optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const categoryReorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1, 'At least one ID required'),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().default(''),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  categoryId: z.string().min(1, 'Category ID is required'),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  categoryId: z.string().optional(),
});
