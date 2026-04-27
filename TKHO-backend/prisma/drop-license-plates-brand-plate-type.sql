-- Remove deprecated columns from license_plates
ALTER TABLE license_plates
  DROP COLUMN IF EXISTS corp_id,
  DROP COLUMN IF EXISTS owner,
  DROP COLUMN IF EXISTS brand,
  DROP COLUMN IF EXISTS plate_type;

ALTER TABLE license_plates
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
