ALTER TABLE "venues"
ADD COLUMN "daily_booking_start_time" VARCHAR(5),
ADD COLUMN "daily_booking_end_time" VARCHAR(5);

COMMENT ON COLUMN "venues"."daily_booking_start_time" IS 'Daily open booking window start (HH:mm). Null = no restriction.';
COMMENT ON COLUMN "venues"."daily_booking_end_time" IS 'Daily open booking window end (HH:mm). Null = no restriction.';
