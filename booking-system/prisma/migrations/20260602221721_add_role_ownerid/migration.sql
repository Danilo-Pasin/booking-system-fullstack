-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'HOST');

-- Add role column to User first (before we need it for the seed)
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'GUEST';

-- Create default HOST user for existing accommodations
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt")
VALUES ('default-host-00000000', 'Default Host', 'host@booking.com', '$2b$10$default', 'HOST', NOW())
ON CONFLICT ("email") DO NOTHING;

-- Add Accommodation columns (nullable first)
ALTER TABLE "Accommodation" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Accommodation" ADD COLUMN "description" TEXT;
ALTER TABLE "Accommodation" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Accommodation" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Backfill existing rows with default HOST
UPDATE "Accommodation" SET "ownerId" = 'default-host-00000000' WHERE "ownerId" IS NULL;
UPDATE "Accommodation" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;

-- Make columns required
ALTER TABLE "Accommodation" ALTER COLUMN "ownerId" SET NOT NULL;
ALTER TABLE "Accommodation" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Accommodation" ADD CONSTRAINT "Accommodation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
