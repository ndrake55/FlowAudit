"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email/templates"
import { revalidatePath } from "next/cache"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "neal@drakeearth.com"

export async function submitSupportTicket(data: { subject: string; message: string }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        throw new Error("Unauthorized")
    }

    const user = session.user

    try {
        // 1. Create Ticket in DB
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user.id,
                subject: data.subject,
                message: data.message,
                status: "OPEN",
            },
        })

        // 2. Send Email to Admin
        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `[FlowAudit Support] New Ticket: ${data.subject}`,
            html: `
        <h2>New Support Ticket</h2>
        <p><strong>From:</strong> ${user.name || 'Unknown'} (${user.email})</p>
        <p><strong>Ticket ID:</strong> ${ticket.id}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
          ${data.message.replace(/\n/g, '<br>')}
        </blockquote>
        <p>You can reply directly to this email to respond to the user.</p>
      `,
            replyTo: user.email, // Standard email reply goes to user
        })

        // 3. Send Confirmation to User
        await sendEmail({
            to: user.email,
            subject: `[FlowAudit] Support Ticket Received: ${data.subject}`,
            html: `
        <h2>Support Ticket Received</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>We've received your support request regarding "${data.subject}".</p>
        <p>Our team will get back to you shortly.</p>
        <hr />
        <p><strong>Your Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
          ${data.message.replace(/\n/g, '<br>')}
        </blockquote>
      `,
        })

        revalidatePath("/dashboard/support")
        return { success: true, ticketId: ticket.id }
    } catch (error) {
        console.error("Failed to submit support ticket:", error)
        return { success: false, error: "Failed to submit ticket" }
    }
}

export async function getUserTickets() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    return await prisma.supportTicket.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: { replies: true } // Include replies if we implement them
    })
}
