'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export async function getUtilityBills() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) return [];

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.tenantId) return [];

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.tenantId) throw new Error("User has no tenant assigned");

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
