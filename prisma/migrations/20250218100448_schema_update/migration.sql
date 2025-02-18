/*
  Warnings:

  - The `status` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `thumbnail` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "thumbnail" SET NOT NULL,
ALTER COLUMN "thumbnail" SET DEFAULT 'https://yourdomain.com/default-thumbnail.jpg',
ALTER COLUMN "duration" SET DATA TYPE BIGINT,
DROP COLUMN "status",
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING';

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");
