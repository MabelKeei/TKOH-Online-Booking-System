-- EvBookings model no longer maps `reason`; baseline still created this column.
ALTER TABLE "ev_bookings" DROP COLUMN IF EXISTS "reason";
