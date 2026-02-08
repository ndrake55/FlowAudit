'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export async function createTestLocation() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Use id instead of clerkUserId
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true }
    });

    if (!user) {
        throw new Error("User not found");
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
