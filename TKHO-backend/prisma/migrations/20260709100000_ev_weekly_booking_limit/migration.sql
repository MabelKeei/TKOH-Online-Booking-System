INSERT INTO "system_settings" ("setting_key", "setting_value", "description", "updated_at")
VALUES
  (
    'EV_weekly_booking_limit',
    '1',
    'Maximum active EV bookings per user per week (Monday to Sunday) for non-admin users',
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("setting_key") DO NOTHING;
