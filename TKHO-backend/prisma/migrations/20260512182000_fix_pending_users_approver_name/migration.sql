-- 修正迁移：补齐审批人姓名快照字段，并调整审批人外键删除策略。

ALTER TABLE "pending_users"
  ADD COLUMN IF NOT EXISTS "approver_name" TEXT;

ALTER TABLE "pending_users"
  DROP CONSTRAINT IF EXISTS "pending_users_approver_user_id_fkey";

ALTER TABLE "pending_users"
  ADD CONSTRAINT "pending_users_approver_user_id_fkey"
  FOREIGN KEY ("approver_user_id") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

COMMENT ON COLUMN "pending_users"."approval_status" IS '审批状态：Pending（待审批）、Approved（已通过）、Rejected（已拒绝）。';
COMMENT ON COLUMN "pending_users"."approver_user_id" IS '审批人用户ID，关联 user.id；若审批人账号被删除，该字段置空。';
COMMENT ON COLUMN "pending_users"."approver_name" IS '审批人姓名快照，用于保留历史展示。';
COMMENT ON COLUMN "pending_users"."reject_reason" IS '拒绝申请时填写的原因。';
