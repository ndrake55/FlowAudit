'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function getUtilityBills() {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return [];

    return prisma.utilityBill.findMany({
        where: { tenantId: user.tenantId },
        include: {
            location: true
        },
        orderBy: { startDate: 'desc' }
    });
}

export interface CreateBillData {
    locationId: string;
    startDate: Date;
    endDate: Date;
    totalWaterGal: number;
    totalCost: number;
    s3Key: string;
}

export async function createUtilityBill(data: CreateBillData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    await prisma.utilityBill.create({
        data: {
            tenantId: user.tenantId,
            locationId: data.locationId,
            startDate: data.startDate,
            endDate: data.endDate,
            totalWaterGal: data.totalWaterGal,
            totalCost: data.totalCost,
            s3Key: data.s3Key
        }
    });

    revalidatePath('/dashboard/bills');
    return { success: true };
}
