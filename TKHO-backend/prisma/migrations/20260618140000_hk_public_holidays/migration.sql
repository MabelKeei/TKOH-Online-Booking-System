CREATE TABLE IF NOT EXISTS "hk_public_holidays" (
    "holiday_date" DATE NOT NULL,
    "summary" TEXT,
    "source_uid" TEXT,
    "synced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hk_public_holidays_pkey" PRIMARY KEY ("holiday_date")
);

UPDATE "system_settings"
SET
  "setting_value" = 'https://www.1823.gov.hk/common/ical/en.json',
  "description" = 'Hong Kong public holidays JSON feed (1823 iCal)',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "setting_key" = 'hk_public_holidays_url';
