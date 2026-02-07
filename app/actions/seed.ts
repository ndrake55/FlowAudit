'use server';

import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function createTestLocation() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    let user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        include: { tenant: true }
    });

    if (!user) {
        // Just-in-time provisioning for dev/handling missing webhooks
        const clerkUser = await currentUser();
        if (!clerkUser) {
            throw new Error("Could not fetch Clerk user details");
        }

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) throw new Error("No email found for user");

        // Transaction: Create Tenant -> Create User
        // Note: Using uuid for tenant slug for simplicity
        const newTenant = await prisma.tenant.create({
            data: {
                name: `${clerkUser.firstName || 'User'}'s Organization`,
                slug: `tenant-${Date.now()}`,
            }
        });

        user = await prisma.user.create({
            data: {
                clerkUserId: userId,
                email: email,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                tenantId: newTenant.id,
                role: 'ADMIN'
            },
            include: { tenant: true }
        });
    }

    // Check if location already exists to avoid duplicates if clicked multiple times rapidly
    const existing = await prisma.location.findFirst({
        where: {
            name: "Test Location 1",
            tenantId: user.tenantId
        }
    });

    if (existing) {
        return { success: true, message: "Location already exists" };
    }

    await prisma.location.create({
        data: {
            name: "Test Location 1",
            tenantId: user.tenantId,
        }
    });

    revalidatePath('/dashboard/audit');
    return { success: true };
}
