-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "accommodationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_accommodationId_idx" ON "Image"("accommodationId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: create Image records for existing accommodations that have imageUrl
INSERT INTO "Image" ("id", "url", "order", "accommodationId")
SELECT gen_random_uuid()::text, "imageUrl", 0, "id"
FROM "Accommodation"
WHERE "imageUrl" IS NOT NULL;
