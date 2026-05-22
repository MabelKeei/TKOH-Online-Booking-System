-- Consolidate meeting_bookings, venue_calendar_bookings, venue_manage_bookings
-- into a single venue_bookings table (test data; new serial ids).

-- Recover from a previous failed deploy attempt
DROP TABLE IF EXISTS "venue_bookings" CASCADE;

CREATE TABLE "venue_bookings" (
    "id" BIGSERIAL NOT NULL,
    "booking_id" TEXT,
    "venue_id" BIGINT,
    "venue_name" TEXT,
    "booker_user_id" BIGINT,
    "booker_corp_id" TEXT,
    "user_name" TEXT,
    "department" TEXT,
    "meeting_title" TEXT,
    "booking_date" DATE,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "time_range" TEXT,
    "attendees" INTEGER,
    "notes" TEXT,
    "color" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "status" TEXT,
    "booking_type" TEXT DEFAULT 'venue',
    "approval_status" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMPTZ(6),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMPTZ(6),
    "reject_reason" TEXT,
    "reserved_by" TEXT,
    "tea_service" JSONB,
    "submitted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "venue_bookings_booking_id_key" ON "venue_bookings"("booking_id");
CREATE INDEX "idx_venue_bookings_venue_date" ON "venue_bookings"("venue_id", "booking_date");
CREATE INDEX "idx_venue_bookings_approval_status" ON "venue_bookings"("approval_status");

ALTER TABLE "venue_bookings" ADD CONSTRAINT "venue_bookings_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO "venue_bookings" (
    "booking_id",
    "venue_id",
    "venue_name",
    "booker_user_id",
    "booker_corp_id",
    "user_name",
    "department",
    "meeting_title",
    "booking_date",
    "time_range",
    "submitted_at",
    "approved_at",
    "approved_by",
    "rejected_at",
    "rejected_by",
    "reject_reason",
    "tea_service",
    "created_at",
    "updated_at",
    "booking_type",
    "approval_status"
)
SELECT
    "booking_id",
    "venue_id",
    "venue_name",
    "booker_employee_id",
    "booker_corp_id",
    "user_name",
    "department",
    "meeting_title",
    "booking_date",
    "time_range",
    "submitted_at",
    "approved_at",
    "approved_by",
    "rejected_at",
    "rejected_by",
    "reject_reason",
    "tea_service",
    "created_at",
    COALESCE("rejected_at", "approved_at", "submitted_at", "created_at"),
    'venue',
    CASE
        WHEN "rejected_at" IS NOT NULL THEN 'rejected'
        WHEN "approved_at" IS NOT NULL THEN 'approved'
        ELSE 'pending'
    END
FROM "meeting_bookings";

INSERT INTO "venue_bookings" (
    "venue_name",
    "meeting_title",
    "booking_date",
    "start_time",
    "end_time",
    "attendees",
    "notes",
    "reserved_by",
    "contact",
    "color",
    "created_at",
    "updated_at",
    "booking_type",
    "status"
)
SELECT
    "room_name",
    "topic",
    "booking_date",
    "start_time",
    "end_time",
    "attendees",
    "notes",
    "reserved_by",
    "contact",
    "color",
    "created_at",
    "created_at",
    'venue',
    'upcoming'
FROM "venue_calendar_bookings";

INSERT INTO "venue_bookings" (
    "meeting_title",
    "venue_name",
    "booking_date",
    "time_range",
    "submitted_at",
    "status",
    "booking_type",
    "reserved_by",
    "contact",
    "email",
    "tea_service",
    "approval_status",
    "approved_by",
    "approved_at",
    "reject_reason",
    "created_at",
    "updated_at"
)
SELECT
    "topic",
    "room",
    "booking_date",
    "time_range",
    "booked_on",
    "status",
    COALESCE("booking_type", 'venue'),
    "reserved_by",
    "contact",
    "email",
    CASE
        WHEN "tea_service_required" THEN jsonb_strip_nulls(
            jsonb_build_object(
                'summary', "tea_service_summary",
                'participants', "tea_service_participants"
            )
        )
        ELSE NULL
    END,
    "approval_status",
    "approved_by",
    "approved_at",
    "reject_reason",
    "created_at",
    COALESCE("approved_at", "booked_on", "created_at")
FROM "venue_manage_bookings";

SELECT setval(
    pg_get_serial_sequence('venue_bookings', 'id'),
    COALESCE((SELECT MAX("id") FROM "venue_bookings"), 1)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "tea_service_requests" tsr
    LEFT JOIN "venue_bookings" vb ON vb."booking_id" = tsr."booking_id"
    WHERE vb."booking_id" IS NULL
  ) THEN
    ALTER TABLE "tea_service_requests"
      ADD CONSTRAINT "tea_service_requests_booking_id_fkey"
      FOREIGN KEY ("booking_id") REFERENCES "venue_bookings"("booking_id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

DROP TABLE IF EXISTS "venue_calendar_bookings";
DROP TABLE IF EXISTS "venue_manage_bookings";
DROP TABLE IF EXISTS "meeting_bookings";
