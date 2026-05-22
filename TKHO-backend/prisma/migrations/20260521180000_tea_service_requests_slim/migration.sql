-- tea_service_requests：仅保留展示板状态；场地/日期/时段/主题/茶歇 JSON 从 venue_bookings 读取

ALTER TABLE "tea_service_requests" DROP CONSTRAINT IF EXISTS "tea_service_requests_venue_id_fkey";

ALTER TABLE "tea_service_requests" DROP COLUMN IF EXISTS "venue_id";
ALTER TABLE "tea_service_requests" DROP COLUMN IF EXISTS "meeting_title";
ALTER TABLE "tea_service_requests" DROP COLUMN IF EXISTS "booking_date";
ALTER TABLE "tea_service_requests" DROP COLUMN IF EXISTS "time_range";
ALTER TABLE "tea_service_requests" DROP COLUMN IF EXISTS "tea_service";

CREATE INDEX IF NOT EXISTS "idx_tea_service_requests_completed"
  ON "tea_service_requests"("completed");

COMMENT ON TABLE "tea_service_requests" IS '茶水展示板待办：一对一关联 venue_bookings；茶歇详情与场地信息通过 venue_booking 关联查询。';
COMMENT ON COLUMN "tea_service_requests"."venue_booking_id" IS '关联 venue_bookings.id（主键即外键，有茶歇任务才存在此行）。';
COMMENT ON COLUMN "tea_service_requests"."completed" IS '茶水间是否已在展示板标记完成。';
COMMENT ON COLUMN "tea_service_requests"."created_at" IS '进入茶水展示板队列的时间。';
COMMENT ON COLUMN "venue_bookings"."tea_service" IS '茶歇需求 JSON（饮品、供应方式、人数、备注等）；展示板通过 tea_service_requests 关联读取。';
