COMMENT ON TABLE "system_settings" IS '系统全局配置键值表；由 Admin System Settings 页面维护，供后台任务与业务逻辑读取。';

COMMENT ON COLUMN "system_settings"."setting_key" IS '配置项键名（主键），如 user_inactive_after_months、hk_public_holidays_url。';
COMMENT ON COLUMN "system_settings"."setting_value" IS '配置项当前值（字符串存储，由业务层解析为数字或 URL 等）。';
COMMENT ON COLUMN "system_settings"."description" IS '配置项说明，便于管理员理解用途。';
COMMENT ON COLUMN "system_settings"."updated_at" IS '该配置项最后更新时间。';

COMMENT ON TABLE "hk_public_holidays" IS '香港公众假期日历；从 1823 官方 JSON 数据源同步，用于 EV/Venue 预订拦截与前端日历展示。';

COMMENT ON COLUMN "hk_public_holidays"."holiday_date" IS '公众假期日期（主键，按自然日）。';
COMMENT ON COLUMN "hk_public_holidays"."summary" IS '假期英文名称（如 The first day of January），来自数据源 vevent.summary。';
COMMENT ON COLUMN "hk_public_holidays"."source_uid" IS '数据源事件唯一标识（1823 iCal vevent.uid），用于同步去重与追溯。';
COMMENT ON COLUMN "hk_public_holidays"."synced_at" IS '该条记录最近一次从远程数据源同步的时间。';
