import { prisma } from "@/lib/prisma";

export interface AuditResult {
    totalTheoreticalUsage: number;
    totalActualUsage: number;
    variance: number;
    leakSuspected: boolean;
}

export interface MachineCalculationInput {
    waterPerCycleGal: number;
    count: number;
    cycles: number;
}

/**
 * Pure function to calculate theoretical usage.
 * Can be used by Server Actions with manual data or by the background worker with DB data.
 */
export function calculateTheoreticalUsage(machines: MachineCalculationInput[]): number {
    let total = 0;
    for (const m of machines) {
        total += m.count * m.cycles * m.waterPerCycleGal;
    }
    return total;
}

/**
 * Pure function to calculate variance and determine leak status.
 */
export function calculateVariance(actual: number, theoretical: number): { variance: number; leakSuspected: boolean } {
    let variance = 0;

    // Avoid division by zero
    if (theoretical > 0) {
        variance = ((actual - theoretical) / theoretical) * 100;
    } else if (actual > 0) {
        variance = Infinity; // Infinite variance (usage without theoretical justification)
    } else {
        variance = 0; // Both 0 implies perfect match (no usage, no bill)
    }

    // 15% Threshold Rule
    const leakSuspected = variance > 15;

    return { variance, leakSuspected };
}

/**
 * Calculates the audit results for a given utility bill from the Database.
 */
export async function calculateAudit(
    utilityBillId: string
): Promise<AuditResult> {
    // 1. Fetch the UtilityBill
    const bill = await prisma.utilityBill.findUnique({
        where: { id: utilityBillId },
    });

    if (!bill) {
        throw new Error(`UtilityBill with ID ${utilityBillId} not found`);
    }

    // 2. Fetch MachineCycleCounts
    const cycleCounts = await prisma.machineCycleCount.findMany({
        where: { utilityBillId },
        include: {
            machine: {
                include: {
                    machineDefinition: true,
                },
            },
        },
    });

    // 3. Map DB data to Calculation Input
    const calculationInputs: MachineCalculationInput[] = cycleCounts.map(entry => ({
        waterPerCycleGal: entry.machine.machineDefinition.waterPerCycleGal,
        count: entry.count,
        cycles: 1 // In the DB model, 'count' is total cycles for that machine?
        // Wait, looking at original code:
        // const machineUsage = count * waterPerCycle; 
        // It seems 'entry.count' IS the cycle count for that period.
        // So we treat it as 1 machine doing N cycles, or N machines doing X cycles?
        // The original code was: const machineUsage = count * waterPerCycle;
        // So 'entry.count' is the multiplier. 
        // We map it effectively as: 1 machine * entry.count cycles * rate.

        // correction: In the new flow we have "Count" (num machines) and "Cycles" (per machine).
        // In the old flow (DB structure), `MachineCycleCount` likely links a SINGLE machine instance to a bill.
        // So count is just cycles.
    }));

    // Fix mapping for old flow compatibility:
    // The DB `MachineCycleCount` has a `count` field. Is that cycles?
    // Original code: `const count = entry.count; const machineUsage = count * waterPerCycle;`
    // Yes, `entry.count` is the number of cycles.

    // So we translate that to our generic input:
    // count: 1 (It represents one machine record's activity), cycles: entry.count.
    const machineInputs = cycleCounts.map(entry => ({
        waterPerCycleGal: entry.machine.machineDefinition.waterPerCycleGal,
        count: 1,
        cycles: entry.count
    }));

    const totalTheoretical = calculateTheoreticalUsage(machineInputs);
    const totalActual = bill.totalWaterGal;

    const { variance, leakSuspected } = calculateVariance(totalActual, totalTheoretical);

    return {
        totalTheoreticalUsage: totalTheoretical,
        totalActualUsage: totalActual,
        variance,
        leakSuspected,
    };
}

/**
 * Saves the audit result to the database.
 * If an audit report already exists for this bill, it updates it.
 */
export async function saveAuditResult(
    utilityBillId: string,
    result: AuditResult
) {
    await prisma.auditReport.upsert({
        where: { utilityBillId },
        update: {
            totalTheoreticalUsage: result.totalTheoreticalUsage,
            totalActualUsage: result.totalActualUsage,
            variancePercentage: result.variance,
            leakSuspected: result.leakSuspected,
        },
        create: {
            utilityBillId,
            totalTheoreticalUsage: result.totalTheoreticalUsage,
            totalActualUsage: result.totalActualUsage,
            variancePercentage: result.variance,
            leakSuspected: result.leakSuspected,
        },
    });
}

/**
 * REVENUE RECONSTRUCTION ENGINE
 * 
 * "Reverse Engineers" the business volume from the confirmed water bill.
 */
export interface ReconstructionInput {
    totalWaterBill: number;
    askingPrice: number;
    machineMix: {
        modelId: string;
        type: string; // "WASHER" | "DRYER"
        count: number;
        waterPerCycle: number;
        vendPrice: number;
    }[];
}

export function calculateRevenueReconstruction(data: ReconstructionInput) {
    // 1. Calculate Weighted Water Rating (Only Washers consume water)
    let totalWeightedWaterRating = 0;
    let washerCount = 0;

    for (const m of data.machineMix) {
        if (m.type === "WASHER") {
            totalWeightedWaterRating += m.count * m.waterPerCycle;
            washerCount += m.count;
        }
    }

    // 2. Solve for "Cycles Per Machine" (Average)
    // Formula: TotalWater = Sum(Count * Cycles * Rate)
    // Assuming Cycles is constant Average across all washers:
    // TotalWater = Cycles * Sum(Count * Rate)
    // Cycles = TotalWater / Sum(Count * Rate)

    let cyclesPerMachine = 0;
    if (totalWeightedWaterRating > 0) {
        cyclesPerMachine = data.totalWaterBill / totalWeightedWaterRating;
    }

    // 3. Calculate Estimated Revenue
    let monthlyRevenue = 0;

    for (const m of data.machineMix) {
        if (m.type === "WASHER") {
            // Revenue = Cycles * Count * Vend
            monthlyRevenue += cyclesPerMachine * m.count * m.vendPrice;
        } else if (m.type === "DRYER") {
            // Assumption: Dryers run 1:1 with Washers?
            // "For every washing cycle we include a drying cycle"
            // If we have 10 Washers doing 100 cycles = 1000 Loads.
            // We assume 1000 Dryer Loads occur.
            // But we have valid Dryer Counts.
            // If we have 1000 Total Loads, how are they distributed?
            // We assume they are distributed among the Dryers.
            // Total Dryer Revenue = Total Washer Loads * Avg Dryer Vend?
            // Or do we stick to "CyclesPerMachine" logic if we assume they are balanced?
            // "CyclesPerMachine" calculated above is "Cycles Per Washer".
            // Total Washer Loads = cyclesPerMachine * washerCount.

            // Allow independent dryer calculation:
            // Total Loads = cyclesPerMachine * washerCount.
            // We apply these Total Loads to the dryers.
            // If we have multiple dryer types, we weight them by count?
            // Simplified: All Dryers share the load. 
            // DryerRevenue = TotalWasherLoads * m.vendPrice (This would duplicate if loop runs multiple dryer rows).
            // We need to know "Percent of Load" this dryer group handles.
            // Let's assume proportional to count against total dryers?

            // Simpler interpretation of User Request: "for every washing cycle we include a drying cycle"
            // This implies the Total Dryer Volume == Total Washer Volume.
            // So Total Dryer Revenue = Total Washer Loads * Average Dryer Vend.
            // However, we have specific rows with specific prices.
            // Let's use the explicit rows.
            // We assign the Total Washer Loads to the dryer rows proportionally to their count.

            // We need total dryer count first.
            // Let's do a second pass or calculate it.
            // For now, let's assume "CyclesPerMachine" applies to Dryers too?
            // If 10 Washers do 100 cycles each (1000 total).
            // And 10 Dryers exist. They do 100 cycles each.
            // If 5 Dryers exist. They do 200 cycles each.
            // So `DryerCycles = (TotalWasherLoads / TotalDryers)`.

            // We need TotalDryers to be accurate.
            // Let's calculate total dryer count first.
            // (Skipping loop optimization for clarity)
        }
    }

    // Refined Revenue Loop
    let totalWasherLoads = cyclesPerMachine * washerCount;
    let totalDryerCount = data.machineMix.filter(m => m.type === "DRYER").reduce((sum, m) => sum + m.count, 0);

    // Reset Revenue and recalc with distribution logic
    monthlyRevenue = 0;

    for (const m of data.machineMix) {
        if (m.type === "WASHER") {
            monthlyRevenue += cyclesPerMachine * m.count * m.vendPrice;
        } else if (m.type === "DRYER") {
            if (totalDryerCount > 0) {
                // Distribute loads
                const shareOfLoads = m.count / totalDryerCount;
                const groupLoads = totalWasherLoads * shareOfLoads;
                monthlyRevenue += groupLoads * m.vendPrice;
            }
        }
    }

    // 4. Valuation
    const annualizedRevenue = monthlyRevenue * 12;
    let valuationMultiple = 0;
    if (annualizedRevenue > 0) {
        valuationMultiple = data.askingPrice / annualizedRevenue;
    }

    return {
        estimatedRevenue: monthlyRevenue,
        valuationMultiple,
        cyclesPerMachine, // Washer Cycles
        annualizedRevenue
    };
}
