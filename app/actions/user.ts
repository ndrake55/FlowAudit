'use server'

import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Retrieves the current authenticated user from Prisma.
 * If the user does not exist (JIT sync), it fetches details from Clerk and creates the User + Tenant.
 */
export async function getOrCreateUser() {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // 1. Try to find in DB
    const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (dbUser) {
        return dbUser;
    }

    // 2. If not found, fetch Clerk details to seed DB
    const clerkUser = await currentUser();
    if (!clerkUser) {
        throw new Error("Clerk user not found");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("User must have an email address");

    // 3. Create Tenant & User Transactionally
    // We create a default Tenant for this user.
    return await prisma.$transaction(async (tx) => {
        const newTenant = await tx.tenant.create({
            data: {
                name: `${clerkUser.firstName || 'User'}'s Organization`,
                slug: `tenant-${userId.slice(0, 8)}-${Date.now()}`, // Simple slug generation
            }
        });

        const newUser = await tx.user.create({
            data: {
                clerkUserId: userId,
                email: email,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                tenantId: newTenant.id,
                role: 'ADMIN', // First user is Admin of their own tenant
            }
        });

        return newUser;
    });
}


export async function completeOnboarding() {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: {
                id: userId,
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
