-- 表名 tea_service_requests -> venue_tea_service

ALTER TABLE "tea_service_requests" RENAME TO "venue_tea_service";

ALTER INDEX IF EXISTS "idx_tea_service_requests_completed"
  RENAME TO "idx_venue_tea_service_completed";

ALTER TABLE "venue_tea_service"
  RENAME CONSTRAINT "tea_service_requests_pkey" TO "venue_tea_service_pkey";

ALTER TABLE "venue_tea_service"
  RENAME CONSTRAINT "tea_service_requests_venue_booking_id_fkey" TO "venue_tea_service_venue_booking_id_fkey";

COMMENT ON TABLE "venue_tea_service" IS '场地预订茶水服务：一对一关联 venue_bookings；茶歇详情以本表 tea_service 为准。';
COMMENT ON COLUMN "venue_tea_service"."venue_booking_id" IS '关联 venue_bookings.id（主键即外键，有茶歇才存在此行）。';
COMMENT ON COLUMN "venue_tea_service"."tea_service" IS '茶歇需求 JSON（饮品、供应方式、人数、备注等）；茶水展示板读本字段。';
COMMENT ON COLUMN "venue_tea_service"."completed" IS '茶水间是否已在展示板标记完成。';
COMMENT ON COLUMN "venue_tea_service"."created_at" IS '进入茶水展示板队列的时间。';
COMMENT ON COLUMN "venue_bookings"."tea_service_required" IS '预订时是否勾选需要茶水服务；为 true 时应有对应 venue_tea_service 行（含茶歇 JSON）。';
