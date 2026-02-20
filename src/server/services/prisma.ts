import { PrismaClient } from '@prisma/client';

// Singleton Prisma client to avoid too many connections
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});
