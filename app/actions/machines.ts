'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export async function getMachines() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) return [];

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.tenantId) return [];

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) return [];

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.tenantId) return [];

    return prisma.location.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { name: 'asc' }
    });
}

export async function createMachine(locationId: string, machineDefinitionId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.tenantId) throw new Error("User has no tenant assigned");

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // Validate quantity
    if (quantity <= 0) throw new Error("Quantity must be positive");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.tenantId) throw new Error("User has no tenant assigned");

    const tenantId = user.tenantId;

    // Verify location belongs to user's tenant
    const location = await prisma.location.findFirst({
        where: {
            id: locationId,
            tenantId
        }
    });

    if (!location) throw new Error("Location not found or access denied");

    // Create machines in a transaction
    await prisma.$transaction(async (tx) => {
        for (let i = 0; i < quantity; i++) {
            await tx.machine.create({
                data: {
                    tenantId,
                    locationId,
                    machineDefinitionId,
                }
            });
        }
    });

    revalidatePath("/dashboard/machines");
    return { success: true };
}
