-- 恢复 tea_service_requests.tea_service（展示板茶歇详情以本表为准）

ALTER TABLE "tea_service_requests" ADD COLUMN "tea_service" JSONB;

UPDATE "tea_service_requests" tsr
SET "tea_service" = COALESCE(vb."tea_service", '{}'::jsonb)
FROM "venue_bookings" vb
WHERE vb."id" = tsr."venue_booking_id";

UPDATE "tea_service_requests"
SET "tea_service" = '{}'::jsonb
WHERE "tea_service" IS NULL;

ALTER TABLE "tea_service_requests" ALTER COLUMN "tea_service" SET NOT NULL;

COMMENT ON TABLE "tea_service_requests" IS '茶水展示板待办：一对一关联 venue_bookings；茶歇详情以本表 tea_service 为准，场地/时段等通过 venue_booking 关联查询。';
COMMENT ON COLUMN "tea_service_requests"."tea_service" IS '茶歇需求 JSON（饮品、供应方式、人数、备注等）；茶水展示板读本字段。';
COMMENT ON COLUMN "venue_bookings"."tea_service" IS '预订时填写的茶歇需求；审批通过进入展示板时复制到 tea_service_requests.tea_service。';
