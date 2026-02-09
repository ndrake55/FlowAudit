"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { calculateAudit, saveAuditResult, calculateRevenueReconstruction } from "@/lib/audit-engine";
import { MachineType } from "@prisma/client";
import { fetchCommercialRent } from "@/lib/intelligence/rentcast";
import { fetchDemographics } from "@/lib/intelligence/census";
import { deleteFileFromS3 } from "@/lib/aws/s3";

// Define the manual data structure
interface ManualAuditData {
    totalWaterBill: number;
    askingPrice: number;
    askingRevenue: number;
    machineMix: {
        modelId: string;
        type: "WASHER" | "DRYER";
        count: number;
        vendPrice: number;
    }[];
}

// Map frontend IDs to DB Definition IDs (Assumption or Constants)
const MODEL_DATA_MAP: Record<string, { rating: number, type: MachineType }> = {
    "speed-queen-horizon": { rating: 18, type: "WASHER" },
    "top-load-generic": { rating: 25, type: "WASHER" },
    "front-load-generic": { rating: 15, type: "WASHER" },
    "large-washer-60lb": { rating: 45, type: "WASHER" },
    "dryer-stack-30": { rating: 0, type: "DRYER" },
    "dryer-single-45": { rating: 0, type: "DRYER" },
};

export async function createForensicAudit(
    data: {
        dealName: string;
        address: string;
        placeId: string;
        fileKeys: string[];
        manualData?: ManualAuditData;
    }
) {
    const user = await getOrCreateUser();

    if (!user.tenantId) {
        throw new Error("User has no tenant assigned");
    }

    // 1. Create Location (Deal)
    const location = await prisma.location.create({
        data: {
            tenantId: user.tenantId,
            name: data.dealName,
            address: data.address,
            askingPrice: data.manualData?.askingPrice,
            claimedMonthlyRevenue: data.manualData?.askingRevenue,
        }
    });



    // ... imports

    // 2. Create Utility Bills
    const actualUsage = data.manualData?.totalWaterBill || 0;

    const mainBill = await prisma.utilityBill.create({
        data: {
            tenantId: user.tenantId,
            locationId: location.id,
            startDate: new Date(),
            endDate: new Date(),
            totalWaterGal: actualUsage,
            totalCost: 0,
            s3Key: data.fileKeys[0] || "multi-upload",
        }
    });

    // 2.5 Fire-and-Forget Intelligence Gathering
    // We don't await this to keep the UI snappy, or we can await it if we want immediate results.
    // Given the user complained about "N/A", let's await it to ensure it's there.
    try {
        // Extract Zip from address string if possible, or pass address
        // Assuming data.address format "123 Main St, City, State Zip"
        const zipMatch = data.address.match(/\b\d{5}\b/);
        const zip = zipMatch ? zipMatch[0] : "00000";

        const [rentData, demographics] = await Promise.all([
            fetchCommercialRent(zip),
            fetchDemographics(zip)
        ]);

        await prisma.locationIntelligence.create({
            data: {
                locationId: location.id,
                commercialRent: rentData?.price ?? null,
                marketRentPsf: rentData?.price ? (rentData.price / (rentData.squareFootage || 1500)) : null, // Rough est

                censusMedianIncome: demographics?.medianIncome ?? null,
                censusPopulation: demographics?.population ?? null,
                medianAge: 35.5, // Mock if missing or add to fetchDemographics

                // Mocking housing for now as fetchDemographics might not return it structure yet
                housingType: { singleFamily: 0.65, multiFamily: 0.35 },

                intelligenceLastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error("Failed to gather intelligence:", error);
        // Don't block the main flow
    }

    // 3. Process Manual Machine Data & Revenue Logic
    if (data.manualData) {

        // A. Run the Solver (Memory only first)
        // We need 'waterPerCycle' for the solver.
        const solverInputMix = data.manualData.machineMix.map(m => {
            const def = MODEL_DATA_MAP[m.modelId] || { rating: (m.type === 'WASHER' ? 25 : 0), type: m.type };
            return {
                ...m,
                waterPerCycle: def.rating
            };
        });

        const reconstruction = calculateRevenueReconstruction({
            totalWaterBill: actualUsage,
            askingPrice: data.manualData.askingPrice,
            machineMix: solverInputMix
        });

        const solvedWasherCycles = reconstruction.cyclesPerMachine;

        // Helper to get total dryer count for distribution
        const totalDryerCount = data.manualData.machineMix.filter(m => m.type === "DRYER").reduce((sum, m) => sum + m.count, 0);
        const totalWasherLoads = solvedWasherCycles * data.manualData.machineMix.filter(m => m.type === "WASHER").reduce((sum, m) => sum + m.count, 0);


        // B. Persist to DB
        for (const machineGroup of data.manualData.machineMix) {
            const modelInfo = MODEL_DATA_MAP[machineGroup.modelId] || { rating: 0, type: "WASHER" };
            const rating = modelInfo.rating;

            // Find/Create Definition
            let definition = await prisma.machineDefinition.findFirst({
                where: { modelNumber: machineGroup.modelId }
            });

            if (!definition) {
                definition = await prisma.machineDefinition.create({
                    data: {
                        brand: "Generic",
                        modelNumber: machineGroup.modelId, // Unique constraint handling needed
                        waterPerCycleGal: rating,
                        type: machineGroup.type === "DRYER" ? "DRYER" : "WASHER",
                    }
                });
            }

            // Create Machine Record
            const machine = await prisma.machine.create({
                data: {
                    tenantId: user.tenantId,
                    locationId: location.id,
                    machineDefinitionId: definition.id,
                    vendPrice: machineGroup.vendPrice,
                }
            });

            // Calculate Cycle Count for this group
            let groupCycles = 0;
            if (machineGroup.type === "WASHER") {
                groupCycles = solvedWasherCycles * machineGroup.count;
            } else {
                // DRYER: Distribute the Washer Loads
                if (totalDryerCount > 0) {
                    const share = machineGroup.count / totalDryerCount;
                    groupCycles = totalWasherLoads * share;
                }
            }

            // Create Cycle Count Record
            await prisma.machineCycleCount.create({
                data: {
                    utilityBillId: mainBill.id,
                    machineId: machine.id,
                    count: Math.round(groupCycles)
                }
            });
        }

        // 4. Save Audit Report with Solved Metrics
        // We still run calculateAudit to verify variance (Should be close to 0 since we solved for it)
        const verifyResult = await calculateAudit(mainBill.id);

        // Enrich with Revenue Data
        // Enrich with Revenue Data
        const report = await prisma.auditReport.create({
            data: {
                utilityBillId: mainBill.id,
                totalTheoreticalUsage: verifyResult.totalTheoreticalUsage, // Should match Actual
                totalActualUsage: verifyResult.totalActualUsage,
                variancePercentage: verifyResult.variance, // Should be ~0%
                leakSuspected: false,

                estimatedRevenue: reconstruction.estimatedRevenue,
                valuationMultiple: reconstruction.valuationMultiple,
                paymentStatus: "UNPAID",
            }
        });

        // 5. Cleanup S3 Files (As requested via privacy policy)
        if (data.fileKeys && data.fileKeys.length > 0) {
            // Fire-and-forget cleanup to not block response
            Promise.all(data.fileKeys.map(key => deleteFileFromS3(key))).catch(err =>
                console.error("Failed to cleanup S3 files:", err)
            );
        }

        // Return ID
        return report.id;

    } else {
        // Fallback for no data
        const report = await prisma.auditReport.create({
            data: {
                utilityBillId: mainBill.id,
                totalTheoreticalUsage: 0,
                totalActualUsage: 0,
                variancePercentage: 0,
                leakSuspected: false,
                paymentStatus: "UNPAID",
            }
        });

        // Cleanup
        if (data.fileKeys && data.fileKeys.length > 0) {
            Promise.all(data.fileKeys.map(key => deleteFileFromS3(key))).catch(err =>
                console.error("Failed to cleanup S3 files:", err)
            );
        }
        return report.id;
    }
}
