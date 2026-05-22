-- booker_user_id -> reserved_by；删除冗余 contact、email

ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "contact";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "email";

ALTER TABLE "venue_bookings" DROP CONSTRAINT IF EXISTS "venue_bookings_booker_user_id_fkey";

ALTER TABLE "venue_bookings" RENAME COLUMN "booker_user_id" TO "reserved_by";

UPDATE "venue_bookings" vb
SET "reserved_by" = NULL
WHERE vb."reserved_by" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = vb."reserved_by");

ALTER TABLE "venue_bookings"
  ADD CONSTRAINT "venue_bookings_reserved_by_fkey"
  FOREIGN KEY ("reserved_by") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

COMMENT ON COLUMN "venue_bookings"."reserved_by" IS '预订人/预留人用户 ID，关联 user.id；姓名、Corp ID、部门、电话、邮箱从 user 读取。';
