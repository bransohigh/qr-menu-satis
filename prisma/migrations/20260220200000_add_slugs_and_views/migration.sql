-- AlterTable: add slug and views fields
ALTER TABLE "categories" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "products" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "products" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "categories_menu_id_slug_key" ON "categories"("menu_id", "slug");
CREATE UNIQUE INDEX "products_menu_id_slug_key" ON "products"("menu_id", "slug");
