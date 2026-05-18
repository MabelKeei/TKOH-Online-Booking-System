-- pending_users 补充申请人联系电话。

ALTER TABLE "pending_users"
  ADD COLUMN IF NOT EXISTS "contact_no" TEXT;

COMMENT ON COLUMN "pending_users"."contact_no" IS '申请人联系电话。';
