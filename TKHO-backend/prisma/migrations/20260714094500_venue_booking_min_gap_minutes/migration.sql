INSERT INTO "system_settings" ("setting_key", "setting_value", "description", "updated_at")
VALUES
  (
    'venue_booking_min_gap_minutes',
    '15',
    'Minimum gap in minutes between consecutive bookings of the same venue (for cleaning turnaround)',
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("setting_key") DO NOTHING;
