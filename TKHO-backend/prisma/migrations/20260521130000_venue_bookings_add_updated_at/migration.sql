-- Add updated_at for venue_bookings (if consolidate migration already ran without this column)

ALTER TABLE "venue_bookings"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "venue_bookings"
SET "updated_at" = COALESCE("rejected_at", "approved_at", "submitted_at", "created_at");
