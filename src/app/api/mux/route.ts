import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Verify Mux webhook signature
function verifyMuxSignature(body: string, signature: string | null, secret: string) {
  if (!signature) {
    console.error("Missing Mux signature");
    return false;
  }

  const [timestampPart, hashPart] = signature.split(",");
  const timestamp = timestampPart?.replace("t=", "");
  const hash = hashPart?.replace("v1=", "");

  if (!timestamp || !hash) {
    console.error("Invalid signature format");
    return false;
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (parseInt(timestamp) < fiveMinutesAgo) {
    console.error("Expired webhook timestamp");
    return false;
  }

  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  if (computedHash !== hash) {
    console.error("Signature verification failed");
    return false;
  }

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MUX_SIGNING_SECRET;
    if (!secret) {
      throw new Error("Mux signing secret is not defined");
    }

    const rawBody = await req.text();
    const signature = req.headers.get("mux-signature");

    if (!verifyMuxSignature(rawBody, signature, secret)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const eventType = body.type;
    console.log("🚀 Received Mux event:", eventType);
    console.log("🔍 Full Payload:", JSON.stringify(body, null, 2));

    switch (eventType) {
      case "video.asset.created": {
        const passThroughId = body?.data?.passthrough;
        if (!passThroughId) {
          console.error("Missing passthrough ID");
          break;
        }

        const result = await prisma.video.update({
          where: { id: passThroughId as string },
          data: { status: "PROCESSING" },
        });

        console.log("✅ Video status updated to PROCESSING:", result);
        break;
      }

      case "video.asset.ready": {
        const assetId = body?.data?.id;
        const playbackId = body?.data?.playback_ids?.[0]?.id;
        const duration = body?.data?.duration;
        const resolution = body?.data?.max_stored_resolution;

        if (!assetId || !playbackId) {
          console.error("Missing asset or playback ID");
          break;
        }

        const video = await prisma.video.findFirst({
          where: { muxAssetId: assetId as string },
        });

        if (!video) {
          console.error("No video found for assetId:", assetId);
          break;
        }

        const result = await prisma.video.update({
          where: { id: video.id },
          data: {
            status: "READY",
            videoLink: `https://stream.mux.com/${playbackId}.m3u8`,
            muxPlayBackId: playbackId,
            duration,
            resolution,
          },
        });

        console.log("✅ Video marked as READY:", result);
        break;
      }

      case "video.upload.asset_created": {
        const assetId = body?.data?.asset_id;
        const uploadId = body?.data?.upload_id;
        const passThroughId = body?.data?.passthrough;

        if (!passThroughId || !assetId || !uploadId) {
          console.error("Missing required data for asset_created");
          break;
        }

        const result = await prisma.video.update({
          where: { id: passThroughId as string },
          data: { muxUploadId: uploadId, muxAssetId: assetId },
        });

        console.log("✅ Video asset details updated:", result);
        break;
      }

      default:
        console.warn("Unhandled Mux event:", eventType);
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error handling Mux webhook:", error);
    return NextResponse.json({ message: "Failed to process webhook", error: error }, { status: 500 });
  }
}
