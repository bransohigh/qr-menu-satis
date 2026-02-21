-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MUSTERI', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'MUSTERI';
