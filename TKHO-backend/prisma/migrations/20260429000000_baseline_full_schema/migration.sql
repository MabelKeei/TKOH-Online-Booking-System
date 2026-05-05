-- Baseline: full public schema from prisma/schema.prisma (empty -> current).
-- For an existing DB that already matches this schema, mark as applied without running:
--   DELETE FROM "_prisma_migrations" WHERE migration_name IN (
--     '202604291200_drop_license_plate_brand_type',
--     '202604291230_refactor_ev_parking_slots_columns'
--   );
--   npx prisma migrate resolve --applied 20260429000000_baseline_full_schema

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" BIGINT NOT NULL,
    "corp_id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT,
    "position" TEXT,
    "email" TEXT,
    "contact" TEXT,
    "annual_quota_ev" INTEGER DEFAULT 0,
    "used_quota_ev" INTEGER DEFAULT 0,
    "annual_quota_venue" INTEGER DEFAULT 0,
    "used_quota_venue" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "last_login_time" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "name_zh" TEXT,
    "tab" TEXT,
    "venue_type" TEXT,
    "color" TEXT,
    "location" TEXT,
    "location_zh" TEXT,
    "display_type" TEXT,
    "image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "room_capacity" INTEGER,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ev_parking_slots" (
    "id" BIGINT NOT NULL,
    "ev_space" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ev_parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ev_time_periods" (
    "id" BIGINT NOT NULL,
    "period" TEXT NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ev_time_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ev_bookings" (
    "id" BIGSERIAL NOT NULL,
    "source_id" BIGINT,
    "employee_corp_id" TEXT,
    "plate_number" TEXT NOT NULL,
    "slot_id" BIGINT NOT NULL,
    "period_id" BIGINT,
    "booking_date" DATE NOT NULL,
    "booked_on" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "source_raw_time" TEXT,
    "source_raw_space" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ev_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_roles" (
    "id" BIGINT NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,
    "annual_venue_quota" INTEGER DEFAULT 0,
    "annual_ev_quota" INTEGER DEFAULT 0,
    "employee_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_vehicles" (
    "id" BIGSERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_window_history" (
    "id" BIGINT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "published_at" TIMESTAMPTZ(6),
    "published_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_window_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_windows" (
    "resource_type" TEXT NOT NULL,
    "current_start_date" DATE NOT NULL,
    "current_end_date" DATE NOT NULL,
    "updated_by" TEXT,
    "updated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_windows_pkey" PRIMARY KEY ("resource_type")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" BIGINT NOT NULL,
    "department_name" TEXT NOT NULL,
    "description" TEXT,
    "employee_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "display_configs" (
    "id" SMALLINT NOT NULL,
    "venue_display_mode" TEXT,
    "ev_display_mode" TEXT,
    "panel_title_text" TEXT,
    "footer_ticker_text" TEXT,
    "qr_code_image" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "display_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "display_venue_rules" (
    "id" BIGSERIAL NOT NULL,
    "venue_id" BIGINT NOT NULL,
    "display_type" TEXT,
    "merge_group" TEXT,
    "display_name" TEXT,
    "arrow_direction" TEXT,

    CONSTRAINT "display_venue_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" BIGINT NOT NULL,
    "corp_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT,
    "position" TEXT,
    "email" TEXT,
    "contact" TEXT,
    "annual_quota_ev" INTEGER DEFAULT 0,
    "used_quota_ev" INTEGER DEFAULT 0,
    "annual_quota_venue" INTEGER DEFAULT 0,
    "used_quota_venue" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_time" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "access_role_id" BIGINT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_plates" (
    "id" BIGINT NOT NULL,
    "employee_id" BIGINT,
    "plate_number" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_plates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_bookings" (
    "id" BIGINT NOT NULL,
    "booking_id" TEXT,
    "source_list" TEXT NOT NULL,
    "venue_id" BIGINT,
    "venue_name" TEXT,
    "booker_employee_id" BIGINT,
    "booker_corp_id" TEXT,
    "user_name" TEXT,
    "department" TEXT,
    "meeting_title" TEXT,
    "booking_date" DATE,
    "time_range" TEXT,
    "submitted_at" TIMESTAMPTZ(6),
    "approved_at" TIMESTAMPTZ(6),
    "approved_by" TEXT,
    "rejected_at" TIMESTAMPTZ(6),
    "rejected_by" TEXT,
    "reject_reason" TEXT,
    "tea_service" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_users" (
    "id" BIGINT NOT NULL,
    "corp_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "department_id" BIGINT,
    "role" TEXT,
    "email" TEXT,
    "reason" TEXT,
    "submitted_at" TIMESTAMPTZ(6),
    "last_login_time" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompts" (
    "id" BIGINT NOT NULL,
    "prompt_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "can_add" BOOLEAN NOT NULL DEFAULT false,
    "template_type" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tea_service_requests" (
    "booking_id" TEXT NOT NULL,
    "venue_id" BIGINT,
    "meeting_title" TEXT,
    "booking_date" DATE,
    "time_range" TEXT,
    "tea_service" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tea_service_requests_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" BIGSERIAL NOT NULL,
    "employee_id" BIGINT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "system_role" TEXT NOT NULL,
    "account_status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_blocks" (
    "id" BIGINT NOT NULL,
    "venue_id" BIGINT NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_calendar_bookings" (
    "id" BIGINT NOT NULL,
    "room_name" TEXT NOT NULL,
    "booking_date" DATE NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "attendees" INTEGER,
    "topic" TEXT,
    "notes" TEXT,
    "reserved_by" TEXT,
    "contact" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_calendar_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_manage_bookings" (
    "id" BIGINT NOT NULL,
    "topic" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "booking_date" DATE,
    "time_range" TEXT,
    "booked_on" TIMESTAMPTZ(6),
    "status" TEXT,
    "booking_type" TEXT,
    "reserved_by" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "tea_service_required" BOOLEAN NOT NULL DEFAULT false,
    "tea_service_summary" TEXT,
    "tea_service_participants" INTEGER,
    "approval_status" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMPTZ(6),
    "reject_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_manage_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_corp_id_key" ON "user"("corp_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_key" ON "user"("account");

-- CreateIndex
CREATE UNIQUE INDEX "venues_name_key" ON "venues"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ev_time_periods_period_key" ON "ev_time_periods"("period");

-- CreateIndex
CREATE INDEX "idx_ev_bookings_slot_period_date" ON "ev_bookings"("slot_id", "period_id", "booking_date");

-- CreateIndex
CREATE UNIQUE INDEX "account_vehicles_plate_key" ON "account_vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "departments_department_name_key" ON "departments"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_corp_id_key" ON "employees"("corp_id");

-- CreateIndex
CREATE UNIQUE INDEX "license_plates_plate_number_key" ON "license_plates"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_bookings_booking_id_key" ON "meeting_bookings"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_employee_id_key" ON "user_accounts"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_username_key" ON "user_accounts"("username");

-- AddForeignKey
ALTER TABLE "ev_bookings" ADD CONSTRAINT "ev_bookings_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "ev_time_periods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ev_bookings" ADD CONSTRAINT "ev_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "ev_parking_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "display_venue_rules" ADD CONSTRAINT "display_venue_rules_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_access_role_id_fkey" FOREIGN KEY ("access_role_id") REFERENCES "access_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "meeting_bookings" ADD CONSTRAINT "meeting_bookings_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tea_service_requests" ADD CONSTRAINT "tea_service_requests_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venue_blocks" ADD CONSTRAINT "venue_blocks_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
