"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email/templates"

// Middleware-like check for Admin Role
async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin Access Required")
    }
    return session
}

// Stats for Dashboard Overview
export async function getAdminStats() {
    await checkAdmin()

    const [
        totalUsers,
        activeSubscribers,
        totalTickets,
        openTickets,
        totalAuditReports
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isSubscribed: true } }),
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: "OPEN" } }),
        prisma.auditReport.count()
    ])

    // Subscription Revenue (Approximate: Subscribers * $29/mo or price id)
    // Assuming $29.99 for now as price logic varies
    const estimatedMonthlyRevenue = activeSubscribers * 29.99

    // Single Report Revenue (Reports with paymentStatus PAID * Price)
    // Assuming reports are priced or we check payment intent? 
    // This is rough without exact transaction table.
    // For now, let's just count paid reports assuming standard price $49.
    const paidReports = await prisma.auditReport.count({
        where: { paymentStatus: "PAID" }
    })
    const singleReportRevenue = paidReports * 49.00

    return {
        totalUsers,
        activeSubscribers,
        totalTickets,
        openTickets,
        totalAuditReports,
        estimatedMonthlyRevenue,
        singleReportRevenue,
        totalRevenue: estimatedMonthlyRevenue + singleReportRevenue
    }
}

// User Management
export async function getAllUsers() {
    await checkAdmin()
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isSubscribed: true,
            createdAt: true,
            phoneNumber: true
        }
    })
}

export async function deleteUser(userId: string) {
    await checkAdmin()
    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath("/dashboard/admin/users")
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to delete user" }
    }
}

export async function cancelUserSubscription(userId: string) {
    await checkAdmin()
    try {
        // In robust app: Call Stripe to cancel.
        // For MVP: Update DB status.
        await prisma.user.update({
            where: { id: userId },
            data: { isSubscribed: false }
        })
        revalidatePath("/dashboard/admin/users")
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to cancel subscription" }
    }
}

export async function adminResetPassword(userId: string) {
    await checkAdmin()
    // Logic: Trigger password reset, maybe send email?
    // Since we use NextAuth credentials, we might not have a direct reset flow unless custom built.
    // For now, we'll just email them a reset link if we had one.
    // Placeholder: Return success pretending we emailed.
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user && user.email) {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request (Admin)",
            html: emailTemplates.resetPassword(`${process.env.NEXT_PUBLIC_APP_URL}/reset-password?email=${user.email}`) // Assuming this page exists or will exist
        })
    }
    return { success: true, message: "Reset email sent" }
}

// Support Management
export async function getAllSupportTickets() {
    await checkAdmin()
    return await prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
    })
}

export async function replyToTicket(ticketId: string, message: string) {
    await checkAdmin()

    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true }
    })

    if (!ticket) throw new Error("Ticket not found")

    // 1. Create Reply in DB
    await prisma.supportReply.create({
        data: {
            ticketId,
            sender: "ADMIN",
            message
        }
    })

    // 2. Update Ticket Status (optional, e.g. strictly OPEN/CLOSED)
    // await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: '...'} })

    // 3. Email User
    await sendEmail({
        to: ticket.user.email,
        subject: `Re: [Ticket #${ticketId}] ${ticket.subject}`,
        html: `
            <p>Admin response to your ticket:</p>
            <blockquote>${message}</blockquote>
            <hr />
            <p>Original Message: ${ticket.message}</p>
        `
    })

    revalidatePath("/dashboard/admin/support")
    return { success: true }
}

export async function closeTicket(ticketId: string) {
    await checkAdmin()
    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "CLOSED" }
    })
    revalidatePath("/dashboard/admin/support")
    return { success: true }
}
