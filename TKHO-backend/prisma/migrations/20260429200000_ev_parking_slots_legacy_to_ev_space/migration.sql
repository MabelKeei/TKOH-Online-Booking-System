-- Align legacy ev_parking_slots (slot_number, space, quantity, slot_type) with current schema (ev_space only).
-- On a DB created only from baseline, this is a no-op for rename; DROP COLUMN IF EXISTS is harmless.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ev_parking_slots'
      AND column_name = 'slot_number'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ev_parking_slots'
      AND column_name = 'ev_space'
  ) THEN
    ALTER TABLE "ev_parking_slots" RENAME COLUMN "slot_number" TO "ev_space";
  END IF;
END $$;

ALTER TABLE "ev_parking_slots"
  DROP COLUMN IF EXISTS "space",
  DROP COLUMN IF EXISTS "quantity",
  DROP COLUMN IF EXISTS "slot_type";
