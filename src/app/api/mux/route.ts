import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type;

    switch (eventType) {
      case "video.asset.created": {
        const passThroughId = body.data.passthrough;

        await prisma.video.update({
          where: { id: passThroughId as string },
          data: { status: "PROCESSING" },
        });

        break;
      }

      case "video.asset.ready": {
        const assetId = body.data.id;
        const playbackId = body.data.playback_ids[0].id;
        const duration = body.data.duration;
        const resolution = body.data.max_stored_resolution;

        const video = await prisma.video.findFirst({
          where: { muxAssetId: assetId as string },
        });

        if (video) {
          await prisma.video.update({
            where: { id: video.id },
            data: {
              status: "READY",
              videoLink: `https://stream.mux.com/${playbackId}.m3u8`,
              muxPlayBackId: playbackId,
              duration,
              resolution,
            },
          });
        }

        break;
      }

      case "video.upload.asset_created": {
        const assetId = body.data.asset_id;
        const uploadId = body.data.upload_id;
        const passThroughId = body.data.passthrough;

        await prisma.video.update({
          where: { id: passThroughId as string },
          data: { muxUploadId: uploadId, muxAssetId: assetId },
        });

        break;
      }

      default:
        console.log("Unhandled Mux event:", eventType);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error handling Mux webhook:", error);
    return NextResponse.json({ message: "Failed to handle webhook" }, { status: 500 });
  }
}
