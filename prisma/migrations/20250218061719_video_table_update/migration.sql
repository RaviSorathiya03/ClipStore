-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "muxAssetId" TEXT,
ADD COLUMN     "status" TEXT,
ALTER COLUMN "videoLink" DROP NOT NULL;
