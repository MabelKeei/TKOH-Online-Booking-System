-- Rename venue important notice prompt key to align with ev_booking_rule_update_notice
UPDATE prompts
SET
  prompt_key = 'venue_booking_rule_update_notice',
  name = 'Venue Booking Rule Update Notice'
WHERE prompt_key = 'venue_booking_lecture_theatre_notice';
