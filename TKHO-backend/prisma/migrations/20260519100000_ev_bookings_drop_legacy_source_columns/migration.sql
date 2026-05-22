-- Legacy migration fields no longer used (source_id, source_raw_time, source_raw_space).
ALTER TABLE "ev_bookings" DROP COLUMN IF EXISTS "source_id";
ALTER TABLE "ev_bookings" DROP COLUMN IF EXISTS "source_raw_time";
ALTER TABLE "ev_bookings" DROP COLUMN IF EXISTS "source_raw_space";
