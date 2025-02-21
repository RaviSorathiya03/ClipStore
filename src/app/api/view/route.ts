import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        const user = await currentUser();
        if(!user){
            return NextResponse.json({
                message: "You must be signed in to view this video"
            })
        }
        const videoId = req.nextUrl.searchParams.get("videoId");
        const view = await prisma.videoView.create({
            data:{
                videoId: videoId as string,
                userId: user.id as string
            }
        })
        NextResponse.json({
            message: "Views created successfully"
        })
    } catch (error) {
        console.log(error);
        NextResponse.json({
            message: "Something went wrong"
        }, {
            status: 500
        })
    }
}