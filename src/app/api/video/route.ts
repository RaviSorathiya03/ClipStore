import { client } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Create a direct upload URL
    const user = await currentUser();
    const body = await req.json();


    const dbchanges = await prisma.video.create({
      data:{
        title: body.title as string,
        userId: user?.id.toString()|| ""
      }
    })


    const upload = await client.video.uploads.create({
      cors_origin: "*", // Allow uploads from any origin (adjust for production)
      new_asset_settings: {
        playback_policy: ["public"], // Set playback policy
        passthrough: dbchanges.id 
      },
    });

    


    return NextResponse.json(
      {
        video: dbchanges,
        uploadId: upload.id,
        url: upload.url, // URL for frontend to upload the video
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating Mux upload URL:", error);
    return NextResponse.json(
      { message: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}