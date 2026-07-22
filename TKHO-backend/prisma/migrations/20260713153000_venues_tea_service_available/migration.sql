ALTER TABLE "venues"
  ADD COLUMN IF NOT EXISTS "tea_service_available" BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN "venues"."tea_service_available" IS '是否提供茶水服务';
