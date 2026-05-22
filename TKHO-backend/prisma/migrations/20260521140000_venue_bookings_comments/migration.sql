-- venue_bookings 表及字段注释

COMMENT ON TABLE "venue_bookings" IS '场地预订主表：统一承载日历视图、我的预订、管理审批等场景（合并自 meeting_bookings、venue_calendar_bookings、venue_manage_bookings）。';

COMMENT ON COLUMN "venue_bookings"."id" IS '主键，自增。';
COMMENT ON COLUMN "venue_bookings"."booking_id" IS '业务预订编号（对外展示），全局唯一。';
COMMENT ON COLUMN "venue_bookings"."venue_id" IS '场地 ID，关联 venues.id；用于冲突检测与关联查询。';
COMMENT ON COLUMN "venue_bookings"."venue_name" IS '场地名称快照（冗余字段，便于历史记录展示）。';
COMMENT ON COLUMN "venue_bookings"."booker_user_id" IS '预订人用户 ID，关联 user.id。';
COMMENT ON COLUMN "venue_bookings"."booker_corp_id" IS '预订人 Corp ID。';
COMMENT ON COLUMN "venue_bookings"."user_name" IS '预订人姓名快照。';
COMMENT ON COLUMN "venue_bookings"."department" IS '预订人所属部门。';
COMMENT ON COLUMN "venue_bookings"."meeting_title" IS '会议/活动主题。';
COMMENT ON COLUMN "venue_bookings"."booking_date" IS '预订日期。';
COMMENT ON COLUMN "venue_bookings"."start_time" IS '开始时间，供日历格展示与时段冲突校验。';
COMMENT ON COLUMN "venue_bookings"."end_time" IS '结束时间，供日历格展示与时段冲突校验。';
COMMENT ON COLUMN "venue_bookings"."time_range" IS '时间段文字描述（如 10:00 - 11:30），用于列表及详情展示。';
COMMENT ON COLUMN "venue_bookings"."attendees" IS '预计参会人数。';
COMMENT ON COLUMN "venue_bookings"."notes" IS '预订备注。';
COMMENT ON COLUMN "venue_bookings"."color" IS '日历块显示颜色（如十六进制色值）。';
COMMENT ON COLUMN "venue_bookings"."contact" IS '联系电话。';
COMMENT ON COLUMN "venue_bookings"."email" IS '联系邮箱。';
COMMENT ON COLUMN "venue_bookings"."status" IS '预订生命周期状态：如 upcoming（未开始）、past（已结束）、canceled（已取消）。';
COMMENT ON COLUMN "venue_bookings"."booking_type" IS '预订类型，默认 venue（场地预订）。';
COMMENT ON COLUMN "venue_bookings"."approval_status" IS '审批状态：pending（待审批）、approved（已通过）、rejected（已拒绝）。';
COMMENT ON COLUMN "venue_bookings"."approved_by" IS '审批通过操作人。';
COMMENT ON COLUMN "venue_bookings"."approved_at" IS '审批通过时间。';
COMMENT ON COLUMN "venue_bookings"."rejected_by" IS '拒绝操作人。';
COMMENT ON COLUMN "venue_bookings"."rejected_at" IS '拒绝时间。';
COMMENT ON COLUMN "venue_bookings"."reject_reason" IS '拒绝原因。';
COMMENT ON COLUMN "venue_bookings"."reserved_by" IS '预留人/预订人姓名（展示用，可与 user_name 并存）。';
COMMENT ON COLUMN "venue_bookings"."tea_service" IS '茶歇服务 JSON（饮品、供应方式、人数、备注等）。';
COMMENT ON COLUMN "venue_bookings"."submitted_at" IS '用户提交预订的时间。';
COMMENT ON COLUMN "venue_bookings"."created_at" IS '记录创建时间。';
COMMENT ON COLUMN "venue_bookings"."updated_at" IS '记录最后修改时间；业务更新时应同步刷新。';
