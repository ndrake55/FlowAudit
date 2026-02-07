"use server";

import { prisma } from "@/lib/prisma";
import { fetchPropertyDetails, fetchMarketTrends } from "@/lib/intelligence/rentcast";
import { fetchDemographics } from "@/lib/intelligence/census";
import { predictEnergyUsage } from "@/lib/intelligence/energy-physics";
import { revalidatePath } from "next/cache";

export async function enrichLocationData(locationId: string) {
    try {
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            include: { locationIntelligence: true }, // Check if exists
        });

        if (!location) {
            throw new Error("Location not found");
        }

        if (!location.address || !location.zipCode) {
            // Cannot enrich without address/zip. 
            // Real-world: return error or partial enrichment?
            // For now, return error state.
            return { success: false, error: "Address and Zip Code are required for enrichment." };
        }

        // Parallel Fetching
        const [propertyDetails, marketTrends, demographics] = await Promise.all([
            fetchPropertyDetails(location.address, location.city ?? undefined, location.state ?? undefined, location.zipCode),
            fetchMarketTrends(location.zipCode),
            fetchDemographics(location.zipCode),
        ]);

        // Data Processing
        // 1. RentCast Data
        const taxAssessments = propertyDetails?.taxAssessments ?? [];

        // Update physical attributes if found and currently missing
        const foundSqFt = propertyDetails?.squareFootage;
        const foundYearBuilt = propertyDetails?.yearBuilt;

        // 2. Physics Engine
        // Use found attributes or fallback to existing location attributes
        const sqFt = foundSqFt ?? location.sqFt ?? 2000; // Default 2000 if unknown
        const yearBuilt = foundYearBuilt ?? location.yearBuilt ?? 1990; // Default 1990

        // "Laundromat" is the primary use case, or derive from property type
        const energyPrediction = predictEnergyUsage(sqFt, yearBuilt, "Laundromat");

        // Persist to DB
        await prisma.$transaction(async (tx) => {
            // Update basic location info if we found better data
            if (foundSqFt || foundYearBuilt) {
                await tx.location.update({
                    where: { id: locationId },
                    data: {
                        sqFt: foundSqFt ?? location.sqFt,
                        yearBuilt: foundYearBuilt ?? location.yearBuilt,
                    }
                });
            }

            // Upsert Intelligence
            const intelData = {
                taxAssessments: taxAssessments as any, // Cast to JSON
                marketRentPsf: marketTrends?.marketRentPsf ?? null,
                censusMedianIncome: demographics?.medianIncome ?? null,
                censusPopulation: demographics?.population ?? null,
                predictedEnergyCost: energyPrediction.monthlyCost,
                intelligenceLastUpdated: new Date()
            };

            if (location.locationIntelligence) {
                await tx.locationIntelligence.update({
                    where: { locationId },
                    data: intelData
                });
            } else {
                await tx.locationIntelligence.create({
                    data: {
                        locationId,
                        ...intelData
                    }
                });
            }
        });

        revalidatePath(`/dashboard/audit/${locationId}`);
        return { success: true };

    } catch (error) {
        console.error("Error enriching location:", error);
        return { success: false, error: "Failed to enrich data." };
    }
}
