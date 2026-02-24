-- Add logoUrl and brand fields to menus
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE "menus" ADD COLUMN IF NOT EXISTS "brand" JSONB;

-- Add isNew field to themes
ALTER TABLE "themes" ADD COLUMN IF NOT EXISTS "is_new" BOOLEAN NOT NULL DEFAULT false;
