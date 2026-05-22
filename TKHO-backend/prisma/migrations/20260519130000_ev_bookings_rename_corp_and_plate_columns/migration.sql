-- Rename ev_bookings columns for clarity
ALTER TABLE "ev_bookings" RENAME COLUMN "employee_corp_id" TO "user_corp_id";

ALTER TABLE "ev_bookings" DROP CONSTRAINT IF EXISTS "ev_bookings_plate_number_fkey";
ALTER TABLE "ev_bookings" RENAME COLUMN "plate_number" TO "license_plate_id";

ALTER TABLE "ev_bookings"
  ADD CONSTRAINT "ev_bookings_license_plate_id_fkey"
  FOREIGN KEY ("license_plate_id") REFERENCES "license_plates"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;
