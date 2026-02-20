-- Add price, currency, features to themes
ALTER TABLE "themes" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) NOT NULL DEFAULT 29.99;
ALTER TABLE "themes" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "themes" ADD COLUMN IF NOT EXISTS "features" TEXT[] NOT NULL DEFAULT '{}';

-- Create purchases table
CREATE TABLE IF NOT EXISTS "purchases" (
  "id"           TEXT        NOT NULL,
  "user_id"      TEXT        NOT NULL,
  "theme_id"     TEXT        NOT NULL,
  "amount"       DECIMAL(10,2) NOT NULL,
  "currency"     TEXT        NOT NULL DEFAULT 'USD',
  "status"       TEXT        NOT NULL DEFAULT 'pending',
  "provider"     TEXT        NOT NULL DEFAULT 'fakepay',
  "provider_ref" TEXT,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "purchases"
  ADD CONSTRAINT "purchases_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "purchases"
  ADD CONSTRAINT "purchases_theme_id_fkey"
  FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Index for common queries
CREATE INDEX IF NOT EXISTS "purchases_user_id_idx"  ON "purchases"("user_id");
CREATE INDEX IF NOT EXISTS "purchases_theme_id_idx" ON "purchases"("theme_id");
CREATE INDEX IF NOT EXISTS "purchases_status_idx"   ON "purchases"("status");
