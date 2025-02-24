import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        const user = await currentUser();
        if(!user){
            return NextResponse.json({
                message: "You must be logged in to like the post"
            }, {
                status: 403
            })
        }
        const videoId = req.nextUrl.searchParams.get("videoId");
        const like = await prisma.$transaction(async (tx)=>{
            const like1 = await tx.like.create({
                data:{
                    videoId: videoId as string,
                    userId: user.id as string
                }
            })

            const likeCount = await prisma.video.update({
                where:{
                    id: videoId as string
                }, data:{
                    likeCount: {increment: 1}
                }
            })

            return {
                like1, 
                likeCount
            }
        })

        NextResponse.json({
            message: "You have liked the post", 
            data: {like}
        }, {
            status: 200
        })
    } catch (error) {
        console.log(error);
        NextResponse.json({
            message: "Something Went Wrong"
        }, {
            status: 500
        })
    }
}


export async function DELETE(req: NextRequest){
    try {
        const user = await currentUser();
        if(!user){
            return NextResponse.json({
                message: "You must be logged in to perform this task"
            }, {
                status: 403
            })
        }
        const videoId = req.nextUrl.searchParams.get("videoId");
        const disLike = await prisma.$transaction(async (tx)=>{
            const like = await tx.like.findFirst({
                where:{
                    userId: user.id as string,
                    videoId: videoId as string
                }
            })

            const disLike = await tx.like.delete({
                where:{
                    id: like?.id as string
                }
            })
            return disLike
        })

        NextResponse.json({
            message: "You have dislike the post successfully",
            data: disLike
        }, {
            status: 200
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