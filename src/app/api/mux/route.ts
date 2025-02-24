import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Verify Mux webhook signature
function verifyMuxSignature(body: string, signature: string | null, secret: string) {
  if (!signature) {
    console.error("🚨 Missing Mux signature");
    return false;
  }

  const [timestampPart, hashPart] = signature.split(",");
  if (!timestampPart || !hashPart) {
    console.error("🚨 Invalid signature format");
    return false;
  }

  const timestamp = timestampPart.replace("t=", "");
  const hash = hashPart.replace("v1=", "");

  if (!timestamp || !hash) {
    console.error("🚨 Missing timestamp or hash in signature");
    return false;
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    console.error("🚨 Expired webhook timestamp");
    return false;
  }

  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  if (computedHash !== hash) {
    console.error("🚨 Signature verification failed");
    console.error("🔍 Computed hash:", computedHash);
    console.error("🔍 Provided hash:", hash);
    return false;
  }

  console.log("✅ Signature verified");
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MUX_SIGNING_SECRET;
    if (!secret) {
      console.error("🚨 Mux signing secret is not defined");
      return NextResponse.json({ message: "Server error" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("mux-signature");

    if (!verifyMuxSignature(rawBody, signature, secret)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error("🚨 Failed to parse JSON body", err);
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const eventType = body?.type;
    console.log("🚀 Received Mux event:", eventType);
    console.log("🔍 Full Payload:", JSON.stringify(body, null, 2));

    if (!eventType) {
      console.error("🚨 Missing event type");
      return NextResponse.json({ message: "Missing event type" }, { status: 400 });
    }

    switch (eventType) {
      case "video.asset.created": {
        const passThroughId = body?.data?.passthrough;
        if (!passThroughId) {
          console.error("🚨 Missing passthrough ID");
          break;
        }

        await prisma.video.update({
          where: { id: passThroughId as string },
          data: { status: "PROCESSING" },
        });

        console.log("✅ Video status updated to PROCESSING for ID:", passThroughId);
        break;
      }

      case "video.asset.ready": {
        const assetId = body?.data?.id;
        const playbackId = body?.data?.playback_ids?.[0]?.id;
        const duration = body?.data?.duration;
        const resolution = body?.data?.max_stored_resolution;

        if (!assetId || !playbackId) {
          console.error("🚨 Missing asset or playback ID");
          break;
        }

        const video = await prisma.video.findFirst({
          where: { muxAssetId: assetId as string },
        });

        if (!video) {
          console.error("🚨 No video found for assetId:", assetId);
          break;
        }

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

        console.log("✅ Video marked as READY for asset ID:", assetId);
        break;
      }

      case "video.upload.asset_created": {
        const assetId = body?.data?.asset_id;
        const uploadId = body?.data?.upload_id;
        const passThroughId = body?.data?.passthrough;

        if (!passThroughId || !assetId || !uploadId) {
          console.error("🚨 Missing required data for asset_created");
          break;
        }

        await prisma.video.update({
          where: { id: passThroughId as string },
          data: { muxUploadId: uploadId, muxAssetId: assetId },
        });

        console.log("✅ Video asset details updated for passthrough ID:", passThroughId);
        break;
      }

      default:
        console.warn("⚠️ Unhandled Mux event:", eventType);
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error handling Mux webhook:", error);
    return NextResponse.json({ message: "Failed to process webhook" }, { status: 500 });
  }
}
