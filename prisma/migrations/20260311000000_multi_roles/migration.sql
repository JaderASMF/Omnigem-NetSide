-- AlterTable: convert single role to roles array
ALTER TABLE "User" ADD COLUMN "roles" "Role"[] DEFAULT ARRAY['GUEST']::"Role"[];

-- Migrate existing data: copy role into roles array
UPDATE "User" SET "roles" = ARRAY["role"] WHERE "role" IS NOT NULL;

-- Drop old column
ALTER TABLE "User" DROP COLUMN "role";
