import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { priceId, mode } = body

        if (!priceId || !mode) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // 1. Get the user from Prisma to check for existing Stripe Customer ID
        const dbUser = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        })

        if (!dbUser) {
            return new NextResponse("User not found in database", { status: 404 })
        }

        let stripeCustomerId = dbUser.stripeCustomerId

        // 2. If no customer ID, create one in Stripe and save to Prisma
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0].emailAddress,
                metadata: {
                    userId: dbUser.id,
                },
            })
            stripeCustomerId = customer.id

            await prisma.user.update({
                where: { id: dbUser.id },
                data: { stripeCustomerId },
            })
        }

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
            metadata: {
                userId: dbUser.id, // Store CUID for webhook verification
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
