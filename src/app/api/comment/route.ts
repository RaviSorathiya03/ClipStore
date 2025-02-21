import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(req:NextRequest){
    try {
        const user = await currentUser();
        const videoId = req.nextUrl.searchParams.get("videoId");
        const body = await req.json();
        if (!videoId) {
            return NextResponse.json(
                { message: "VideoId is required" },
                { status: 400 }
            );
        }
        if(!user){
            return NextResponse.json({
                message: "You Must Be login to do this comment"
            }, {
                status: 403
            })
        }

        const comment = await prisma.comment.create({
            data:{
                comment: body.comment as string,
                userId: user.id,
                videoId: videoId

            }
        })

        NextResponse.json({
            message: "You have successfully commented in the post"
        }, {
            status: 200
        })
        
    } catch (error) {
        console.log(error);
        NextResponse.json({
            message: "Something went Wrong"
        }, {
            status: 500
        })
        
    }
}

export async function PUT(req: NextRequest){
    try {
        const user = await currentUser();
        const videoId = req.nextUrl.searchParams.get("videoId");
        const commentId = req.nextUrl.searchParams.get("commentId");
        const body = await req.json();
        if (!videoId) {
            return NextResponse.json(
                { message: "VideoId is required" },
                { status: 400 }
            );
        }
        if(!user){
            return NextResponse.json({
                message: "You Must Be login to do this comment"
            }, {
                status: 403
            })
        }

        const comment = await prisma.comment.update({
            where:{
                id: commentId as string, 
                userId: user.id
            }, data:{
                comment: body.comment
            }
        })

        NextResponse.json({
            message: "You have successfully commented in the post"
        }, {
            status: 200
        })
        
    } catch (error) {
        console.log(error);
        NextResponse.json({
            message: "Something went Wrong"
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
                message: "You Must Be Logged in to delete the comment"
            }, {
                status: 403
            })
        }
        const commentId = req.nextUrl.searchParams.get("commentId");
        const deleteComment = await prisma.comment.delete({
            where:{
                id: commentId as string, 
                userId: user.id
            }
        })
        NextResponse.json({
            message: "Comment Successfully Deleted"
        }, {
            status: 200
        })
    } catch (error) {
        console.log(error);
        NextResponse.json({
            message: "Something Went Wrong",
        }, {
            status: 500
        })
    }
}