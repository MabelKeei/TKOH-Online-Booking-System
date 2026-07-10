-- 提交人（submitter）与预定使用者（license_plates.user_id）区分
ALTER TABLE "ev_bookings" ADD COLUMN IF NOT EXISTS "submitter" BIGINT;

UPDATE "ev_bookings" AS eb
SET "submitter" = lp.user_id
FROM "license_plates" AS lp
WHERE eb.license_plate_id = lp.id
  AND eb.submitter IS NULL
  AND lp.user_id IS NOT NULL;

ALTER TABLE "ev_bookings"
  ADD CONSTRAINT "ev_bookings_submitter_fkey"
  FOREIGN KEY ("submitter") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

COMMENT ON COLUMN "ev_bookings"."submitter" IS '提交人用户 ID，关联 user.id；与 license_plates.user_id（预定使用者）区分。';
