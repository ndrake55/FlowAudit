'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getMachines() {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return [];

    return prisma.machine.findMany({
        where: { tenantId: user.tenantId },
        include: {
            location: true,
            machineDefinition: true
        },
        orderBy: { location: { name: 'asc' } }
    });
}

export async function getMachineDefinitions() {
    return prisma.machineDefinition.findMany({
        orderBy: { brand: 'asc' }
    });
}

export async function getLocations() {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return [];

    return prisma.location.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' }
    });
}

export async function createMachine(locationId: string, machineDefinitionId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    await prisma.machine.create({
        data: {
            tenantId: user.tenantId,
            locationId,
            machineDefinitionId
        }
    });

    revalidatePath('/dashboard/machines');
    return { success: true };
}

/**
 * Bulk creates machines for a location.
 */
export async function bulkAddMachines(
    locationId: string,
    machineDefinitionId: string,
    quantity: number,
    startId: number
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Validate quantity
    if (quantity <= 0) throw new Error("Quantity must be positive");

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Verify location belongs to user's tenant
    const location = await prisma.location.findFirst({
        where: {
            id: locationId,
            tenantId: user.tenantId
        }
    });

    if (!location) throw new Error("Location not found or access denied");

    // Create machines in a transaction
    await prisma.$transaction(async (tx) => {
        for (let i = 0; i < quantity; i++) {
            await tx.machine.create({
                data: {
                    tenantId: user.tenantId,
                    locationId,
                    machineDefinitionId,
                }
            });
        }
    });

    revalidatePath("/dashboard/machines");
    return { success: true };
}
