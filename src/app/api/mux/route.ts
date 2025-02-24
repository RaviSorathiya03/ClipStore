import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Function to verify Mux signature
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

  // Ensure timestamp is recent (within 5 minutes)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    console.error("🚨 Expired webhook timestamp");
    return false;
  }

  // Compute the HMAC hash
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

    console.log("📡 Webhook received with signature:", signature);

    if (!verifyMuxSignature(rawBody, signature, secret)) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error("🚨 Failed to parse JSON body:", err);
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const eventType = body?.type;
    console.log("🚀 Received Mux event:", eventType);
    console.log("🔍 Full Payload:", JSON.stringify(body, null, 2));

    if (!eventType) {
      console.error("🚨 Missing event type");
      return NextResponse.json({ message: "Missing event type" }, { status: 400 });
    }

    // Handle Mux events
    switch (eventType) {
      case "video.asset.created": {
        const passThroughId = body?.data?.passthrough;
        if (!passThroughId) {
          console.error("🚨 Missing passthrough ID");
          break;
        }

        await prisma.video.update({
          where: { id: passThroughId },
          data: { status: "PROCESSING" },
        });

        console.log("✅ Video status updated to PROCESSING for ID:", passThroughId);
        break;
      }

      case "video.asset.ready": {
        const { id: assetId, playback_ids, duration, max_stored_resolution, passthrough } = body?.data;
        const playbackId = playback_ids?.[0]?.id;

        if (!assetId || !playbackId || !passthrough) {
          console.error("🚨 Missing required data for video.asset.ready");
          break;
        }

        const video = await prisma.video.findUnique({
          where: { id: passthrough },
        });

        if (!video) {
          console.error("🚨 No video found for passthrough ID:", passthrough);
          break;
        }

        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: "READY",
            videoLink: `https://stream.mux.com/${playbackId}.m3u8`,
            muxPlayBackId: playbackId,
            duration,
            resolution: max_stored_resolution,
          },
        });

        console.log("✅ Video marked as READY for asset ID:", assetId);
        break;
      }

      case "video.upload.asset_created": {
        const { asset_id: assetId, upload_id: uploadId, passthrough } = body?.data;

        if (!passthrough || !assetId || !uploadId) {
          console.error("🚨 Missing required data for video.upload.asset_created");
          break;
        }

        await prisma.video.update({
          where: { id: passthrough },
          data: { muxUploadId: uploadId, muxAssetId: assetId },
        });

        console.log("✅ Video asset details updated for passthrough ID:", passthrough);
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
