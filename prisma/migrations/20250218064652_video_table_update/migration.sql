/*
  Warnings:

  - You are about to drop the column `resolvedUrl` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "resolvedUrl",
ADD COLUMN     "resolution" TEXT;
