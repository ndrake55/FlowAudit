"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateAudit, saveAuditResult } from "@/lib/audit-engine";
import { revalidatePath } from "next/cache";
import { s3Client } from "@/lib/aws/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { processBill } from "@/lib/gemini";
import { env } from "@/lib/env";
import { getOrCreateUser } from "@/app/actions/user";

/**
 * Submits cycle counts for a set of machines for a specific utility bill.
 * This is a transactional operation: it deletes existing counts for this bill/machine pairs and inserts new ones.
 * 
 * @param utilityBillId - The ID of the utility bill
 * @param counts - Array of { machineId, count }
 */
export async function submitCycleCounts(
    utilityBillId: string,
    counts: { machineId: string; count: number }[]
) {
    // Validate inputs (basic)
    if (!utilityBillId) throw new Error("Utility Bill ID is required");

    // Check if bill exists
    const bill = await prisma.utilityBill.findUnique({
        where: { id: utilityBillId },
    });
    if (!bill) throw new Error("Utility Bill not found");

    // Transactional Upsert/Replacements
    // Since we might be updating, and Prisma upsert is one-by-one, 
    // or we can delete for these machines and insert.
    // Let's use a transaction to be safe.

    await prisma.$transaction(async (tx) => {
        for (const item of counts) {
            if (item.count < 0) throw new Error(`Count for machine ${item.machineId} must be non-negative`);

            // Upsert the cycle count
            await tx.machineCycleCount.upsert({
                where: {
                    utilityBillId_machineId: {
                        utilityBillId,
                        machineId: item.machineId
                    }
                },
                update: {
                    count: item.count
                },
                create: {
                    utilityBillId,
                    machineId: item.machineId,
                    count: item.count
                }
            });
        }
    });

    try {
        revalidatePath(`/dashboard/bills/${utilityBillId}`);
    } catch (e) {
        console.warn('Revalidate failed', e);
    }
}

/**
 * Triggers the audit calculation for a utility bill.
 * Saves the result to the AuditReport table.
 * 
 * @param utilityBillId - The ID of the utility bill
 */
export async function runAudit(utilityBillId: string) {
    if (!utilityBillId) throw new Error("Utility Bill ID is required");

    // 1. Calculate
    const result = await calculateAudit(utilityBillId);

    // 2. Save
    await saveAuditResult(utilityBillId, result);

    try {
        revalidatePath(`/dashboard/bills/${utilityBillId}`);
    } catch (e) {
        console.warn('Revalidate failed', e);
    }

    return result;
}

export async function getCommonLocations() {
    return await prisma.location.findMany({
        include: {
            tenant: true
        }
    });
}

export async function getLocationMachines(locationId: string) {
    if (!locationId) return [];

    const machines = await prisma.machine.findMany({
        where: { locationId },
        include: {
            machineDefinition: true,
            location: true
        }
    });

    return machines.map(machine => ({
        ...machine,
        vendPrice: machine.vendPrice.toNumber(),
        location: {
            ...machine.location,
            askingPrice: machine.location.askingPrice?.toNumber() ?? null,
            claimedMonthlyRevenue: machine.location.claimedMonthlyRevenue?.toNumber() ?? null,
        }
    }));
}

export async function processUploadedBill(s3Key: string) {
    if (!s3Key) throw new Error("S3 Key is required");

    const command = new GetObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: s3Key,
    });

    try {
        const response = await s3Client.send(command);
        if (!response.Body) throw new Error("No body in S3 response");

        const byteArray = await response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);

        const data = await processBill(buffer);

        return {
            ...data,
            totalWaterUsage: data.raw_usage_value,
            usageUnit: data.raw_usage_unit,
            vendorName: data.vendor_name || "Unknown Vendor",
        };
    } catch (error) {
        console.error("Error processing uploaded bill:", error);
        throw new Error("Failed to process bill");
    }
}

export async function performAuditAction(
    locationId: string,
    totalWaterUsage: number,
    cycleCounts: Record<string, number>
) {
    if (!locationId) throw new Error("Location ID is required");

    const location = await prisma.location.findUnique({
        where: { id: locationId },
        select: { tenantId: true }
    });

    if (!location) throw new Error("Location not found");

    // Create a UtilityBill record
    const bill = await prisma.utilityBill.create({
        data: {
            tenantId: location.tenantId,
            locationId: locationId,
            startDate: new Date(), // Default to now
            endDate: new Date(),
            totalWaterGal: totalWaterUsage,
            totalCost: 0,
            s3Key: "manual_audit_" + Date.now(),
        }
    });

    // Prepare counts
    const countsArray = Object.entries(cycleCounts).map(([machineId, count]) => ({
        machineId,
        count
    }));

    // Verify user definition (Auth check)
    // JIT Sync ensures user exists
    const user = await getOrCreateUser();

    // Submit counts
    await submitCycleCounts(bill.id, countsArray);

    // Run Audit (Logic extracted here so we can control the paymentStatus)
    const calculation = await calculateAudit(bill.id);

    // Determine initial payment status
    // If user is subscribed, auto-PAID. Else UNPAID.
    const paymentStatus = user.isSubscribed ? 'PAID' : 'UNPAID';

    // Save with status
    await prisma.auditReport.upsert({
        where: { utilityBillId: bill.id },
        update: {
            totalTheoreticalUsage: calculation.totalTheoreticalUsage,
            totalActualUsage: calculation.totalActualUsage,
            variancePercentage: calculation.variance,
            leakSuspected: calculation.leakSuspected,
            paymentStatus,
        },
        create: {
            utilityBillId: bill.id,
            totalTheoreticalUsage: calculation.totalTheoreticalUsage,
            totalActualUsage: calculation.totalActualUsage,
            variancePercentage: calculation.variance,
            leakSuspected: calculation.leakSuspected,
            paymentStatus,
        }
    });

    try {
        revalidatePath(`/dashboard/bills/${bill.id}`);
    } catch (e) {
        console.warn('Revalidate failed', e);
    }

    // Return sanitized result if UNPAID
    if (paymentStatus === 'UNPAID') {
        return {
            ...calculation,
            variance: Infinity, // Or handled by frontend as masked
            variancePercentage: 0,
            leakSuspected: false, // Don't allow them to guess from boolean
            totalTheoreticalUsage: 0,
            isLocked: true,
            billId: bill.id // Needed for the redirect link
        };
    }

    return {
        ...calculation,
        isLocked: false,
        billId: bill.id
    };
}

export async function getRecentAudits(count: number = 20) {
    return await prisma.auditReport.findMany({
        take: count,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            utilityBill: {
                include: {
                    location: true,
                    tenant: true,
                }
            }
        }
    });
}
/**
 * Fetches all deals (locations) for the current tenant.
 * Includes nested data to derive status and variance.
 */
export async function getDeals() {
    const user = await getOrCreateUser();

    if (!user.tenantId) return [];

    const locations = await prisma.location.findMany({
        where: { tenantId: user.tenantId },
        include: {
            utilityBills: {
                include: {
                    auditReport: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            },
            machines: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return locations;
}

/**
 * Creates a full audit setup: Location, Machines, and UtilityBill.
 */
export async function createFullAudit(data: {
    name: string
    askingPrice?: number
    claimedMonthlyRevenue?: number
    machines: { machineDefinitionId: string, count: number, vendPrice: number }[]
    s3Key?: string
}) {
    const user = await getOrCreateUser();

    if (!user.tenantId) {
        throw new Error("User does not have a tenant");
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Create Location
        const location = await tx.location.create({
            data: {
                tenantId: user.tenantId!, // Asserted because of check above
                name: data.name,
                askingPrice: data.askingPrice,
                claimedMonthlyRevenue: data.claimedMonthlyRevenue,
            }
        });

        // 2. Create Machines
        for (const item of data.machines) {
            for (let i = 0; i < item.count; i++) {
                await tx.machine.create({
                    data: {
                        tenantId: user.tenantId!,
                        locationId: location.id,
                        machineDefinitionId: item.machineDefinitionId,
                        vendPrice: item.vendPrice,
                    }
                });
            }
        }

        // 3. Create Utility Bill (if s3Key provided)
        if (data.s3Key) {
            await tx.utilityBill.create({
                data: {
                    tenantId: user.tenantId!,
                    locationId: location.id,
                    startDate: new Date(),
                    endDate: new Date(),
                    totalWaterGal: 0,
                    totalCost: 0,
                    s3Key: data.s3Key,
                }
            });
        }

        return { locationId: location.id };
    });
}

export async function deleteAudit(locationId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify ownership
    const location = await prisma.location.findUnique({
        where: { id: locationId }
    });

    if (!location || location.tenantId !== user.tenantId) {
        throw new Error("Not found or unauthorized");
    }

    // Delete in correct order due to foreign keys
    await prisma.$transaction(async (tx) => {
        // 1. Delete MachineCycleCounts via UtilityBills
        // Find all bills for this location
        const bills = await tx.utilityBill.findMany({
            where: { locationId: locationId },
            select: { id: true }
        });
        const billIds = bills.map(b => b.id);

        if (billIds.length > 0) {
            await tx.machineCycleCount.deleteMany({
                where: { utilityBillId: { in: billIds } }
            });

            // 2. Delete AuditReports
            await tx.auditReport.deleteMany({
                where: { utilityBillId: { in: billIds } }
            });

            // 3. Delete UtilityBills
            await tx.utilityBill.deleteMany({
                where: { locationId: locationId }
            });
        }

        // 4. Delete Machines
        await tx.machine.deleteMany({
            where: { locationId: locationId }
        });

        // 5. Delete LocationIntelligence
        await tx.locationIntelligence.deleteMany({
            where: { locationId: locationId }
        });

        // 6. Delete Location
        await tx.location.delete({
            where: { id: locationId }
        });
    });

    revalidatePath("/dashboard");
}
