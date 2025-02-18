import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type;

    switch (eventType) {
      case "video.asset.created":
        try {
            const assetId = body.data.id;
            const passThroughId = body.data.passThorughId;
            await prisma.video.update({
                where:{
                    id: passThroughId as string
                }, data:{
                    muxAssetId: assetId as string,
                    status: "PROCESSING"
                }
            })
        } catch (error) {
            console.error(error);
            NextResponse.json({
                message: "Error updating video asset",
               
            } , {status: 500})
        }
        break;

      case "video.asset.ready":
        try {
            const assetId = body.data.id;
            const playbackId = body.data.playbackId;
            const duration = body.data.duration;
            const resolution = body.data.resolution;
    
            const video = await prisma.video.findFirst({
                where:{
                    muxAssetId: assetId as string
                }
            })
    
            if(video){
                await prisma.video.update({
                    where:{
                        id: video.id
                    }, data:{
                        status: "READY", 
                        videoLink: `https://stream.mux.com/${playbackId}.m3u8`,
                        muxPlayBackId: playbackId as string,
                        duration: duration as number,
                        resolution: resolution as string
                    }
                })
            }
        } catch (error) {
            console.error(error);
            NextResponse.json({
                message: "Error updating Video"
            }, {status: 500})
        }
        break;

      case "video.upload.asset_created":
        try {
            const assetId = body.data.id;
            const uploadId = body.data.id;
            const passThroughId = body.data.passThorughId;
            await prisma.video.update({
                where:{
                    id: passThroughId
                }, data:{
                    muxAssetId: assetId as string,
                    muxUploadId: uploadId as string
                }
            })
        } catch (error) {
            console.error(error);
            NextResponse.json({
                message: "Error Uploading Video"
            }, {status: 500})
        }
        break;

      default:
        console.log("Unhandled Mux event:", eventType);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error("Error handling Mux webhook:", error);
    return NextResponse.json(
      { message: "Failed to handle webhook" },
      { status: 500 }
    );
  }
}