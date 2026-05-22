-- venue_bookings：tea_service JSON 改为 tea_service_required 布尔标记

ALTER TABLE "venue_bookings"
  ADD COLUMN "tea_service_required" BOOLEAN NOT NULL DEFAULT false;

UPDATE "venue_bookings" vb
SET "tea_service_required" = true
WHERE EXISTS (
  SELECT 1 FROM "tea_service_requests" tsr WHERE tsr."venue_booking_id" = vb."id"
);

UPDATE "venue_bookings"
SET "tea_service_required" = true
WHERE "tea_service" IS NOT NULL
  AND "tea_service"::text NOT IN ('null', '{}');

ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "tea_service";

COMMENT ON COLUMN "venue_bookings"."tea_service_required" IS '预订时是否勾选需要茶水服务；为 true 时应有对应 tea_service_requests 行（含茶歇 JSON）。';
COMMENT ON COLUMN "tea_service_requests"."tea_service" IS '茶歇需求 JSON（饮品、供应方式、人数、备注等）；预订勾选茶歇时写入，展示板读本字段。';
