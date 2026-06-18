CREATE TABLE IF NOT EXISTS "system_settings" (
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT,
    "description" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("setting_key")
);

INSERT INTO "system_settings" ("setting_key", "setting_value", "description", "updated_at")
VALUES
  (
    'user_inactive_after_months',
    '6',
    'Months without login before user status becomes Inactive',
    CURRENT_TIMESTAMP
  ),
  (
    'hk_public_holidays_url',
    'https://www.1823.gov.hk/common/ical/en.json',
    'Hong Kong public holidays reference URL',
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("setting_key") DO NOTHING;
