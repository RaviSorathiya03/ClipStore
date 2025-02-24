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

  const isValid = computedHash === hash;
  if (!isValid) {
    console.error("Signature verification failed");
  }

  return isValid;
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
    console.log("Received Mux event:", eventType);
    console.log("Payload:", body);

    switch (eventType) {
      case "video.asset.created": {
        const passThroughId = body.data.passthrough;
        console.log("Processing asset creation for video ID:", passThroughId);

        const result = await prisma.video.update({
          where: { id: passThroughId as string },
          data: { status: "PROCESSING" },
        });

        console.log("Database update result:", result);
        break;
      }

      case "video.asset.ready": {
        const assetId = body.data.id;
        const playbackId = body.data.playback_ids?.[0]?.id;
        const duration = body.data.duration;
        const resolution = body.data.max_stored_resolution;

        console.log("Processing asset ready for asset ID:", assetId);

        const video = await prisma.video.findFirst({
          where: { muxAssetId: assetId as string },
        });

        if (!video) {
          console.error("No video found with muxAssetId:", assetId);
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

        console.log("Video marked as READY:", result);
        break;
      }

      case "video.upload.asset_created": {
        const assetId = body.data.asset_id;
        const uploadId = body.data.upload_id;
        const passThroughId = body.data.passthrough;

        console.log("Processing asset created with passthrough ID:", passThroughId);

        const result = await prisma.video.update({
          where: { id: passThroughId as string },
          data: { muxUploadId: uploadId, muxAssetId: assetId },
        });

        console.log("Database update result:", result);
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
