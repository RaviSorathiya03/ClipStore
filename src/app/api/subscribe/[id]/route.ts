import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// POST route to create a subscription
export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 403 }
            );
        }

        // Extract query parameters
        const subscribedToId = req.nextUrl.searchParams.get("subscribedToId");
        if (!subscribedToId) {
            return NextResponse.json(
                { message: "subscribedToId is required" },
                { status: 400 }
            );
        }

        // Create a new subscription
        const subscribe = await prisma.subscription.create({
            data: {
                subscriberId: user.id,
                subscribedToId: subscribedToId,
            },
        });

        return NextResponse.json(
            { subscribe: subscribe, message: "Subscribed successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}

// PUT route to delete a subscription (unsubscribe)
export async function PUT(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 403 }
            );
        }

        // Extract query parameters
        const subscribedToId = req.nextUrl.searchParams.get("subscribedToId");
        if (!subscribedToId) {
            return NextResponse.json(
                { message: "subscribedToId is required" },
                { status: 400 }
            );
        }

        // Delete the subscription
        const unSubscribe = await prisma.subscription.delete({
            where: {
                subscriberId_subscribedToId: {
                    subscriberId: user.id,
                    subscribedToId: subscribedToId,
                },
            },
        });

        return NextResponse.json(
            { message: unSubscribe },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}