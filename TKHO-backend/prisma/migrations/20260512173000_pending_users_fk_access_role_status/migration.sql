-- Normalize pending_users: replace department/role text with FK ids and add approval status.

ALTER TABLE "pending_users" ADD COLUMN "access_role_id" BIGINT;
ALTER TABLE "pending_users" ADD COLUMN "approval_status" TEXT NOT NULL DEFAULT 'Pending';

UPDATE "pending_users" p
SET "department_id" = d.id
FROM "departments" d
WHERE p."department_id" IS NULL
  AND p."department" IS NOT NULL
  AND TRIM(p."department") = d."department_name";

UPDATE "pending_users" p
SET "access_role_id" = ar.id
FROM "access_roles" ar
WHERE p."role" IS NOT NULL
  AND TRIM(p."role") = ar."role_name";

ALTER TABLE "pending_users"
  ADD CONSTRAINT "pending_users_department_id_fkey"
  FOREIGN KEY ("department_id") REFERENCES "departments"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "pending_users"
  ADD CONSTRAINT "pending_users_access_role_id_fkey"
  FOREIGN KEY ("access_role_id") REFERENCES "access_roles"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "pending_users" DROP COLUMN "department";
ALTER TABLE "pending_users" DROP COLUMN "role";
ALTER TABLE "pending_users" DROP COLUMN "last_login_time";
