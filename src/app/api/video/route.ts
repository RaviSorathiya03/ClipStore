import { client } from "@/lib/mux";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Step 1: Get the current user
    const user = await currentUser();
    const body = await req.json();
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    console.log(user.id);

    // Step 2: Create a video record in the database
    const dbVideo = await prisma.video.create({
      data: {
        title: body.title as string,
        userId: user.id,
        status: "UPLOADING",
      },
    });

    console.log("Video record created:", dbVideo);

    // Step 3: Create a direct upload URL with Mux
    const upload = await client.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["public"],
        passthrough: dbVideo.id.toString(),
      },
    });

    console.log("Mux upload created:", upload);

    // Step 4: Return the response
    return NextResponse.json(
      {
        video: dbVideo,
        uploadId: upload.id,
        url: upload.url,
      },
      { status: 200 }
    );
  } catch (error) {
    // Step 5: Handle errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("Error creating Mux upload URL:", errorMessage);
    return NextResponse.json(
      { message: "Failed to create upload URL", error: errorMessage },
      { status: 500 }
    );
  }
}