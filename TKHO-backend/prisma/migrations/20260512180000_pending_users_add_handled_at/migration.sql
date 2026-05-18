-- pending_users 增加处理时间（审批通过/拒绝均记录操作时间）。

ALTER TABLE "pending_users"
  ADD COLUMN IF NOT EXISTS "handled_at" TIMESTAMPTZ(6);

COMMENT ON COLUMN "pending_users"."handled_at" IS '审批处理时间；在通过或拒绝操作时写入。';
