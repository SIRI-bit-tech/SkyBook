-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role"),
ALTER COLUMN "role" SET DEFAULT 'user';