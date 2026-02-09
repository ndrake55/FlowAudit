"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(data: {
    name?: string
    phoneNumber?: string
    jobTitle?: string
    location?: string
    bio?: string
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
                jobTitle: data.jobTitle,
                location: data.location,
                bio: data.bio,
            },
        })

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update profile:", error)
        return { success: false, error: "Failed to update profile" }
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
