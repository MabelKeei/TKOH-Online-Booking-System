-- displayType is authoritative on venues.display_type; strip legacy copies from JSON
UPDATE "display_configs"
SET "venue_rules_json" = COALESCE(
  (
    SELECT jsonb_agg(elem - 'displayType' - 'display_type')
    FROM jsonb_array_elements("venue_rules_json") AS elem
  ),
  '[]'::jsonb
)
WHERE "venue_rules_json" IS NOT NULL
  AND jsonb_typeof("venue_rules_json") = 'array';
