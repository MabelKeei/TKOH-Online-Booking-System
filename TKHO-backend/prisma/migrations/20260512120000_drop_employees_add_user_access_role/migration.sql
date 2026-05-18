-- Single login identity: `user` table. Drop legacy `employees` / `user_accounts`.
-- Preserve access_role assignment from employees where corp_id matches.

ALTER TABLE "user" ADD COLUMN "access_role_id" BIGINT;

UPDATE "user" u
SET "access_role_id" = e."access_role_id"
FROM "employees" e
WHERE u."corp_id" = e."corp_id" AND e."access_role_id" IS NOT NULL;

ALTER TABLE "user" ADD CONSTRAINT "user_access_role_id_fkey" FOREIGN KEY ("access_role_id") REFERENCES "access_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

DROP TABLE IF EXISTS "user_accounts";
DROP TABLE IF EXISTS "employees";
