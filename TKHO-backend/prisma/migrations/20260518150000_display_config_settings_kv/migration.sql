CREATE TABLE IF NOT EXISTS "display_config_settings" (
    "config_key" TEXT NOT NULL,
    "config_value" TEXT,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "display_config_settings_pkey" PRIMARY KEY ("config_key")
);

-- Migrate from legacy display_configs row (id = 1) when table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'display_configs'
  ) THEN
    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'venue_display_mode', dc.venue_display_mode, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.venue_display_mode IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'ev_display_mode', dc.ev_display_mode, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.ev_display_mode IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'merge.panel_title_text', dc.panel_title_text, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.panel_title_text IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'merge.footer_ticker_text', dc.footer_ticker_text, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.footer_ticker_text IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'merge.qr_code_image', dc.qr_code_image, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.qr_code_image IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'ev.footer_ticker_text', dc.ev_footer_ticker_text, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.ev_footer_ticker_text IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'meta.updated_by', dc.updated_by, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.updated_by IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    INSERT INTO "display_config_settings" ("config_key", "config_value", "updated_at")
    SELECT 'meta.updated_at', dc.updated_at::text, dc.updated_at
    FROM "display_configs" dc WHERE dc.id = 1 AND dc.updated_at IS NOT NULL
    ON CONFLICT ("config_key") DO UPDATE SET
      config_value = EXCLUDED.config_value,
      updated_at = EXCLUDED.updated_at;

    DROP TABLE "display_configs";
  END IF;
END $$;
