-- Normalize user department/role: FK to departments + access_roles only; drop duplicated text columns.

ALTER TABLE "user" ADD COLUMN "department_id" BIGINT;

UPDATE "user" u
SET "department_id" = d.id
FROM "departments" d
WHERE u."department" IS NOT NULL
  AND TRIM(u."department") = d."department_name";

UPDATE "user" u
SET "access_role_id" = ar.id
FROM "access_roles" ar
WHERE u."role" IS NOT NULL
  AND TRIM(u."role") = ar."role_name";

ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "user" DROP COLUMN "department";
ALTER TABLE "user" DROP COLUMN "role";
ALTER TABLE "user" DROP COLUMN "position";
