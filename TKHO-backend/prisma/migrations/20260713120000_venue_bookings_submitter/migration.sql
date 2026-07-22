-- 提交人（submitter）与预订人（reserved_by）区分
ALTER TABLE "venue_bookings" ADD COLUMN IF NOT EXISTS "submitter" BIGINT;

UPDATE "venue_bookings" AS vb
SET "submitter" = vb.reserved_by
WHERE vb.submitter IS NULL
  AND vb.reserved_by IS NOT NULL;

ALTER TABLE "venue_bookings"
  ADD CONSTRAINT "venue_bookings_submitter_fkey"
  FOREIGN KEY ("submitter") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

COMMENT ON COLUMN "venue_bookings"."submitter" IS '提交人用户 ID，关联 user.id；与 reserved_by（预订人）区分。';
