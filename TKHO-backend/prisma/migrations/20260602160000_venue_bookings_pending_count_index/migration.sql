-- 加速 admin pending-counts / 待审批列表按类型+状态+日期筛选
CREATE INDEX IF NOT EXISTS "idx_venue_bookings_pending_count"
ON "venue_bookings" ("booking_type", "approval_status", "booking_date");
