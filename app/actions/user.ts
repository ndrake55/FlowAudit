'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Retrieves the current authenticated user from Prisma.
 * Ensures the user has a Tenant (creating one if missing, e.g. for new OAuth users).
 */
export async function getOrCreateUser() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 1. Try to find in DB
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!dbUser) {
        // This should technically not happen if session exists via PrismaAdapter
        throw new Error("User not found in database");
    }

    // 2. If User has no Tenant (e.g. first time Google Login), create one
    if (!dbUser.tenantId) {
        return await prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: {
                    name: `${dbUser.name || 'User'}'s Organization`,
                    slug: `tenant-${userId.slice(0, 8)}-${Date.now()}`,
                }
            });

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    tenantId: newTenant.id,
                    role: 'ADMIN',
                }
            });

            return updatedUser;
        });
    }

    return dbUser;
}


export async function completeOnboarding() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                hasSeenOnboarding: true,
            },
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to update onboarding status:", error)
        return { success: false, error: "Failed to update status" }
    }
}
