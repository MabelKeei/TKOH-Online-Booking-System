INSERT INTO "system_settings" ("setting_key", "setting_value", "description", "updated_at")
VALUES
  (
    'EV_date_update_time',
    '13:00',
    'Daily time (HH:mm, Hong Kong) when EV booking calendar rolls forward to release the next day quota',
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("setting_key") DO NOTHING;
