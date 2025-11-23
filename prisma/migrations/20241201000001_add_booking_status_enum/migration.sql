-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'checked_in', 'cancelled');

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "BookingStatus" USING ("status"::text::"BookingStatus"),
ALTER COLUMN "status" SET DEFAULT 'pending';