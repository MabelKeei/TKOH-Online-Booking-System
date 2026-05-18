-- Restore display_venue_rules (display_type stays on venues only)
CREATE TABLE IF NOT EXISTS "display_venue_rules" (
    "id" BIGSERIAL NOT NULL,
    "venue_id" BIGINT NOT NULL,
    "merge_group" TEXT,
    "display_name" TEXT,
    "arrow_direction" TEXT,
    CONSTRAINT "display_venue_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "display_venue_rules_venue_id_key"
ON "display_venue_rules"("venue_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'display_venue_rules_venue_id_fkey'
  ) THEN
    ALTER TABLE "display_venue_rules"
    ADD CONSTRAINT "display_venue_rules_venue_id_fkey"
    FOREIGN KEY ("venue_id") REFERENCES "venues"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;

-- Migrate from display_configs.venue_rules_json when present
INSERT INTO "display_venue_rules" ("venue_id", "merge_group", "display_name", "arrow_direction")
SELECT
  (elem->>'venueId')::bigint,
  NULLIF(elem->>'mergeGroup', ''),
  NULLIF(elem->>'displayName', ''),
  NULLIF(elem->>'arrowDirection', '')
FROM "display_configs" dc,
LATERAL jsonb_array_elements(
  CASE
    WHEN dc.venue_rules_json IS NOT NULL AND jsonb_typeof(dc.venue_rules_json) = 'array'
    THEN dc.venue_rules_json
    ELSE '[]'::jsonb
  END
) AS elem
WHERE dc.id = 1
  AND elem->>'venueId' ~ '^\d+$'
ON CONFLICT ("venue_id") DO UPDATE SET
  merge_group = EXCLUDED.merge_group,
  display_name = EXCLUDED.display_name,
  arrow_direction = EXCLUDED.arrow_direction;

ALTER TABLE "display_configs" DROP COLUMN IF EXISTS "venue_rules_json";
