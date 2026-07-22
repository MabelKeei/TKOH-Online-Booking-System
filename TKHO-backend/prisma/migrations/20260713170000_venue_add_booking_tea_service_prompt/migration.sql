INSERT INTO "prompts" ("id", "prompt_key", "name", "content", "category", "can_add", "template_type")
SELECT
  COALESCE((SELECT MAX("id") FROM "prompts"), 0) + 1,
  'venue_add_booking_tea_service',
  'Tea Service Required',
  E'Reminder prompt:\nOther venues: ADS, Ad hoc bookings: GO',
  'system_fixed',
  false,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM "prompts" WHERE "prompt_key" = 'venue_add_booking_tea_service'
);

UPDATE "prompts"
SET "content" = E'Reminder prompt:\nOther venues: ADS, Ad hoc bookings: GO'
WHERE "prompt_key" = 'venue_add_booking_tea_service';
