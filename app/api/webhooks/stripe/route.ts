import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is exported from here or similar
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { emailTemplates } from "@/lib/email/templates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://flowaudit.net";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        // Handle Subscription Mode
        if (session.mode === "subscription" && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            ) as any

            await prisma.user.update({
                where: {
                    id: session.metadata.userId,
                },
                data: {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    isSubscribed: true,
                },
            })
        }
        // Handle One-Time Payment Mode
        else if (session.mode === "payment") {
            // Handle Audit Unlock
            // We use 'auditReportId' which actually maps to utilityBillId in our unique constraint
            if (session.metadata?.auditReportId) {
                await prisma.auditReport.update({
                    where: {
                        id: session.metadata.auditReportId
                    },
                    data: {
                        paymentStatus: 'PAID',
                        stripeSessionId: session.id
                    }
                });
            }

            // For now, we simply ensure the Stripe Customer ID is valid.
            // TODO: Implement 'Credits' or specific 'Location Unlock' logic here.
            if (session.customer) {
                await prisma.user.update({
                    where: {
                        id: session.metadata.userId,
                    },
                    data: {
                        stripeCustomerId: session.customer as string,
                        // We do NOT set isSubscribed = true for one-time payments
                    },
                })
            }
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as any
        const subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id

        const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
        ) as any

        if (subscription.customer) {
            await prisma.user.update({
                where: {
                    stripeCustomerId: subscription.customer as string,
                },
                data: {
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                },
            })

            // Send Email Notification
            if (invoice.customer_email) {
                await sendEmail({
                    to: invoice.customer_email,
                    subject: "Payment Successful - FlowAudit Subscription",
                    html: emailTemplates.subscriptionPaid(`${APP_URL}/dashboard/settings`)
                });
            } else {
                // Try to fetch user from DB to get email?
                // For now, rely on Stripe's customer_email.
            }
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as any

        if (subscription.customer) {
            await prisma.user.update({
                where: {
                    stripeCustomerId: subscription.customer as string,
                },
                data: {
                    isSubscribed: false,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000), // Could be past date
                },
            })
        }
    }

    return new NextResponse(null, { status: 200 });
}
