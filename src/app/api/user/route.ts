import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import {  NextResponse } from "next/server";

export async function POST(){
    try {
        const user = await currentUser();
        if(!user){
            return NextResponse.json({
                message: "You Must Be Logged in to perform this task"
            }, {
                status: 403
            })
        }

        const existingUser = await prisma.user.findFirst({
            where:{
                id: user.id, 
                email: user.emailAddresses[0].emailAddress
            }
        })

        if(existingUser){
            return NextResponse.json({
                message: "User already exist in the db"
            }, {
                status: 200
            })
        }


        const saveUser = await prisma.user.create({
            data:{
                id: user.id,
                firstName: user.firstName as string, 
                lastName: user.lastName as string, 
                email: user.emailAddresses[0].emailAddress,
                username: user.username as string || ""
            }
        })

        NextResponse.json({
            message: "user saved in the db correctly", 
            data: saveUser
        }, {
            status:200
        })
    } catch (error) {
        console.log(error);
        NextResponse.json({
            message: "Somethign went Wrong"
        }, {
            status: 500
        })
    }
}