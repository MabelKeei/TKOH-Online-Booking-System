-- 删除冗余列；approved_by / rejected_by 改为 user.id 外键；booker_user_id 加外键

ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "booker_corp_id";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "user_name";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "department";
ALTER TABLE "venue_bookings" DROP COLUMN IF EXISTS "time_range";

-- booker_user_id：清理无效引用后加外键
UPDATE "venue_bookings" vb
SET "booker_user_id" = NULL
WHERE vb."booker_user_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = vb."booker_user_id");

ALTER TABLE "venue_bookings"
  ADD CONSTRAINT "venue_bookings_booker_user_id_fkey"
  FOREIGN KEY ("booker_user_id") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

-- approved_by：TEXT -> BIGINT（按姓名或 corp_id 匹配 user，测试数据匹配不到则置空）
ALTER TABLE "venue_bookings" ADD COLUMN "approved_by_user_id" BIGINT;

UPDATE "venue_bookings" vb
SET "approved_by_user_id" = u."id"
FROM "user" u
WHERE vb."approved_by" IS NOT NULL
  AND trim(vb."approved_by") <> ''
  AND (u."name" = vb."approved_by" OR u."corp_id" = vb."approved_by");

ALTER TABLE "venue_bookings" DROP COLUMN "approved_by";
ALTER TABLE "venue_bookings" RENAME COLUMN "approved_by_user_id" TO "approved_by";

-- rejected_by：TEXT -> BIGINT
ALTER TABLE "venue_bookings" ADD COLUMN "rejected_by_user_id" BIGINT;

UPDATE "venue_bookings" vb
SET "rejected_by_user_id" = u."id"
FROM "user" u
WHERE vb."rejected_by" IS NOT NULL
  AND trim(vb."rejected_by") <> ''
  AND (u."name" = vb."rejected_by" OR u."corp_id" = vb."rejected_by");

ALTER TABLE "venue_bookings" DROP COLUMN "rejected_by";
ALTER TABLE "venue_bookings" RENAME COLUMN "rejected_by_user_id" TO "rejected_by";

UPDATE "venue_bookings" vb
SET "approved_by" = NULL
WHERE vb."approved_by" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = vb."approved_by");

UPDATE "venue_bookings" vb
SET "rejected_by" = NULL
WHERE vb."rejected_by" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "user" u WHERE u."id" = vb."rejected_by");

ALTER TABLE "venue_bookings"
  ADD CONSTRAINT "venue_bookings_approved_by_fkey"
  FOREIGN KEY ("approved_by") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "venue_bookings"
  ADD CONSTRAINT "venue_bookings_rejected_by_fkey"
  FOREIGN KEY ("rejected_by") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

COMMENT ON COLUMN "venue_bookings"."booker_user_id" IS '预订人用户 ID，关联 user.id。';
COMMENT ON COLUMN "venue_bookings"."approved_by" IS '审批通过操作人用户 ID，关联 user.id。';
COMMENT ON COLUMN "venue_bookings"."rejected_by" IS '拒绝操作人用户 ID，关联 user.id。';
COMMENT ON COLUMN "venue_bookings"."reserved_by" IS '预留人/预订人姓名（展示用，可与 booker 关联用户并存）。';
