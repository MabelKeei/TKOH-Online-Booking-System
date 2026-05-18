-- Consolidate venue display rules into display_configs.venue_rules_json
ALTER TABLE "display_configs"
ADD COLUMN IF NOT EXISTS "venue_rules_json" JSONB;

-- Migrate existing rows from display_venue_rules (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'display_venue_rules'
  ) THEN
    UPDATE "display_configs" dc
    SET "venue_rules_json" = COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'venueId', r.venue_id::text,
            'mergeGroup', COALESCE(r.merge_group, ''),
            'displayName', COALESCE(r.display_name, ''),
            'arrowDirection', COALESCE(r.arrow_direction, '')
          )
          ORDER BY r.venue_id
        )
        FROM "display_venue_rules" r
      ),
      '[]'::jsonb
    )
    WHERE dc.id = 1
      AND (dc.venue_rules_json IS NULL OR dc.venue_rules_json = 'null'::jsonb);

    DROP TABLE IF EXISTS "display_venue_rules";
  END IF;
END $$;
