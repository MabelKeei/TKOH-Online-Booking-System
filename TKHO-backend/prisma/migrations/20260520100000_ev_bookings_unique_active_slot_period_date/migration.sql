-- P0: prevent double-booking the same slot for a period on a date (active bookings only)
CREATE UNIQUE INDEX IF NOT EXISTS "ev_bookings_active_slot_period_date_key"
ON "ev_bookings" ("slot_id", "period_id", "booking_date")
WHERE "status" IN ('pending', 'confirmed');

-- Speed up per-period availability counts
CREATE INDEX IF NOT EXISTS "idx_ev_bookings_period_date_active"
ON "ev_bookings" ("period_id", "booking_date")
WHERE "status" IN ('pending', 'confirmed');
