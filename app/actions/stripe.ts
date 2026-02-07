'use server'

import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { STRIPE_PRICES } from "@/lib/stripe-constants"

export async function createCheckoutSession(
    priceId: string,
    mode: "payment" | "subscription" = "subscription",
    metadata: { auditReportId?: string } = {}
) {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
        redirect("/sign-in")
    }

    // 1. Get the user from Prisma to check for existing Stripe Customer ID
    const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!dbUser) {
        throw new Error("User not found in database")
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
        allow_promotion_codes: true, // Enable user-facing coupons
        metadata: {
            userId: dbUser.id, // Store CUID for webhook verification
            ...metadata,
        },
    })

    // 4. Redirect user
    if (session.url) {
        redirect(session.url)
    }
}

export async function createOneTimeAuditCheckout(auditReportId: string) {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
        redirect("/sign-in")
    }

    // 1. Get/Create Customer
    const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!dbUser) throw new Error("User not found")

    let stripeCustomerId = dbUser.stripeCustomerId
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.emailAddresses[0].emailAddress,
            metadata: { userId: dbUser.id },
        })
        stripeCustomerId = customer.id
        await prisma.user.update({
            where: { id: dbUser.id },
            data: { stripeCustomerId },
        })
    }

    // 2. Create Checkout Session for One-Time Payment
    const PRICE_ID = STRIPE_PRICES.single_deal;

    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
            {
                price: PRICE_ID,
                quantity: 1,
            },
        ],
        mode: "payment", // One-time payment
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/audit/${auditReportId}`, // Back to the audit page
        allow_promotion_codes: true, // Enable user-facing coupons
        metadata: {
            userId: dbUser.id,
            auditReportId: auditReportId, // CRITICAL: Link payment to specific report
            type: 'one_time_audit'
        },
    })

    if (session.url) {
        redirect(session.url)
    }
}

export async function createCustomerPortalSession() {
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!dbUser || !dbUser.stripeCustomerId) {
        throw new Error("User not found or no subscription")
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    })

    if (session.url) {
        redirect(session.url)
    }
}

export async function createSubscriptionCheckout(auditReportId?: string) {
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    // Call the generic function with the specific price ID
    await createCheckoutSession(STRIPE_PRICES.searcher_plan, "subscription", { auditReportId })
}

export async function syncStripeStatus(sessionId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' && session.metadata?.auditReportId) {
            // Check if already paid to avoid redundant DB writes
            const report = await prisma.auditReport.findUnique({
                where: { id: session.metadata.auditReportId }
            });

            if (report && report.paymentStatus !== 'PAID') {
                await prisma.auditReport.update({
                    where: { id: session.metadata.auditReportId },
                    data: {
                        paymentStatus: 'PAID',
                        stripeSessionId: session.id
                    }
                });
                return { success: true, message: "Payment verified" };
            }
            return { success: true, message: "Already paid" };
        }
        return { success: false, error: "Payment not completed" };
    } catch (error) {
        console.error("Sync Error", error);
        return { success: false, error: "Failed to verify session" };
    }
}

export async function getUserInvoices() {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Unauthorized")
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    })

    if (!dbUser || !dbUser.stripeCustomerId) {
        return []
    }

    try {
        const invoices = await stripe.invoices.list({
            customer: dbUser.stripeCustomerId,
            limit: 20, // Limit to last 20 invoices
        })

        return invoices.data.map((invoice) => ({
            id: invoice.id,
            number: invoice.number,
            date: new Date(invoice.created * 1000).toLocaleDateString(),
            amount: (invoice.total / 100).toFixed(2),
            status: invoice.status,
            pdf: invoice.invoice_pdf,
        }))
    } catch (error) {
        console.error("Failed to fetch invoices:", error)
        return []
    }
}
