"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(data: {
    name?: string
    phoneNumber?: string
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                phoneNumber: data.phoneNumber,
            },
        })

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

export async function deleteUserAccount() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    try {
        // Implement soft delete or hard delete. 
        // For now, let's just delete the user. 
        // Note: You might need to handle related data (cascades) or soft delete if preferred.
        // Assuming strict schema cascading or manual cleanup if needed.

        // Caution: If there are foreign key constraints without cascade delete, this will fail.
        // User has relations to Account, Session, Tenant (optional), etc.
        // Prisma schema usually handles cascades for NextAuth models (Account, Session).

        await prisma.user.delete({
            where: { id: userId }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to delete account:", error)
        return { success: false, error: "Failed to delete account. Please contact support." }
    }
}

export async function getOrCreateUser() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user) {
        throw new Error("User not found")
    }

    return user
}
