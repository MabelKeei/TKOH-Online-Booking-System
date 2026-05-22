-- venue_bookings：删除冗余列；审批字段合并为 handle_by / handled_at
-- tea_service_requests：主键改为 venue_booking_id，关联 venue_bookings.id

-- 1) tea_service_requests：booking_id -> venue_booking_id
ALTER TABLE "tea_service_requests" DROP CONSTRAINT IF EXISTS "tea_service_requests_booking_id_fkey";

ALTER TABLE "tea_service_requests" ADD COLUMN IF NOT EXISTS "venue_booking_id" BIGINT;

UPDATE "tea_service_requests" tsr
SET "venue_booking_id" = vb."id"
FROM "venue_bookings" vb
WHERE tsr."booking_id" IS NOT NULL
  AND vb."booking_id" IS NOT NULL
  AND tsr."booking_id" = vb."booking_id";

DELETE FROM "tea_service_requests" WHERE "venue_booking_id" IS NULL;

ALTER TABLE "tea_service_requests" DROP CONSTRAINT IF EXISTS "tea_service_requests_pkey";
ALTER TABLE "tea_service_requests" DROP COLUMN IF EXISTS "booking_id";

ALTER TABLE "tea_service_requests"
  ADD CONSTRAINT "tea_service_requests_pkey" PRIMARY KEY ("venue_booking_id");

ALTER TABLE "tea_service_requests"
  ADD CONSTRAINT "tea_service_requests_venue_booking_id_fkey"
  FOREIGN KEY ("venue_booking_id") REFERENCES "venue_bookings"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;

-- 2) venue_bookings：合并审批字段
ALTER TABLE "venue_bookings" ADD COLUMN IF NOT EXISTS "handle_by" BIGINT;
ALTER TABLE "venue_bookings" ADD COLUMN IF NOT EXISTS "handled_at" TIMESTAMPTZ(6);

UPDATE "venue_bookings"
SET
  "handled_at" = COALESCE("rejected_at", "approved_at"),
  "handle_by" = COALESCE("rejected_by", "approved_by");

ALTER TABLE "venue_bookings" DROP CONSTRAINT IF EXISTS "venue_bookings_approved_by_fkey";
ALTER TABLE "venue_bookings" DROP CONSTRAINT IF EXISTS "venue_bookings_rejected_by_fkey";

DROP INDEX IF EXISTS "venue_bookings_booking_id_key";

ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "reserved_by";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "booking_id";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "venue_name";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "color";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "approved_by";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "approved_at";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "rejected_by";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "rejected_at";

UPDATE "venue_bookings" vb
SET "handle_by" = NULL
WHERE vb."handle_by" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = vb."handle_by");

ALTER TABLE "venue_bookings"
  ADD CONSTRAINT "venue_bookings_handle_by_fkey"
  FOREIGN KEY ("handle_by") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

COMMENT ON COLUMN "venue_bookings"."handle_by" IS '审批处理人用户 ID（通过或拒绝），关联 user.id。';
COMMENT ON COLUMN "venue_bookings"."handled_at" IS '审批处理时间（通过或拒绝）。';
COMMENT ON COLUMN "venue_bookings"."venue_id" IS '场地 ID，关联 venues.id；名称与颜色通过场地关联获取。';
COMMENT ON COLUMN "tea_service_requests"."venue_booking_id" IS '关联 venue_bookings.id（一对一茶歇记录）。';
