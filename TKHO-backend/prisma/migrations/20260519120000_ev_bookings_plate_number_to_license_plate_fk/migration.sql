-- ev_bookings.plate_number: TEXT plate string -> BIGINT FK to license_plates.id
ALTER TABLE "ev_bookings" ADD COLUMN IF NOT EXISTS "plate_number_new" BIGINT;

UPDATE "ev_bookings" AS eb
SET "plate_number_new" = lp."id"
FROM "license_plates" AS lp
WHERE eb."plate_number" IS NOT NULL
  AND UPPER(TRIM(eb."plate_number"::TEXT)) = UPPER(TRIM(lp."plate_number"));

DELETE FROM "ev_bookings" WHERE "plate_number_new" IS NULL;

ALTER TABLE "ev_bookings" DROP COLUMN "plate_number";
ALTER TABLE "ev_bookings" RENAME COLUMN "plate_number_new" TO "plate_number";
ALTER TABLE "ev_bookings" ALTER COLUMN "plate_number" SET NOT NULL;

ALTER TABLE "ev_bookings"
  ADD CONSTRAINT "ev_bookings_plate_number_fkey"
  FOREIGN KEY ("plate_number") REFERENCES "license_plates"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;
