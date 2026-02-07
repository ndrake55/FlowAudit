import { env } from "@/lib/env";
import { geminiModel } from "@/lib/gemini";
import { z } from "zod";

export interface WaterRateInfo {
    providerName: string;
    ratePerUnit: number; // Cost per 748 gals (HCF) or 1000 gals
    sewerRatePerUnit?: number; // Added: Volumetric Sewer Rate
    unitType: "HCF" | "KGAL" | "GAL";
    fixedBaseFee?: number; // Estimated fixed monthly charge (Water)
    sewerFixedFee?: number; // Added: Fixed Sewer Charge
    tierStructure?: string;
    isEstimate: boolean;
}

const RateSchema = z.object({
    providerName: z.string(),
    ratePerUnit: z.number(),
    sewerRatePerUnit: z.number().optional(),
    unitType: z.enum(["HCF", "CCF", "KGAL", "GAL"]),
    fixedBaseFee: z.number().optional(),
    sewerFixedFee: z.number().optional(),
    tierStructure: z.string().optional(),
});

/**
 * Uses Gemini to find local commercial water rates.
 */
export async function findWaterRates(city: string, state: string, zip: string): Promise<WaterRateInfo | null> {
    if (!env.GOOGLE_GEMINI_API_KEY) return null;

    try {
        const prompt = `You are a utility rate expert. 
        Job: Find the current Commercial Water AND Sewer Rates for ${city}, ${state} ${zip} for the current year.
        
        Focus on "Commercial" or "Business" rates.
        1. Find the Water Volumetric Rate (Tier 1 or Base).
        2. Find the Sewer Volumetric Rate (often based on water usage).
        3. Identify the Unit (CCF, HCF, KGAL, or GAL). Note: CCF and HCF are the same (748 Gallons).
        4. Identify any fixed monthly meter fees (estimate for a standard 1-inch or 2-inch commercial meter).

        Return strictly JSON with this schema:
        {
            "providerName": "Name of Utility",
            "ratePerUnit": number, // Water Volumetric Rate
            "sewerRatePerUnit": number, // Sewer Volumetric Rate (0 if included or unknown)
            "unitType": "HCF" | "CCF" | "KGAL" | "GAL",
            "fixedBaseFee": number, // Water Fixed Fee
            "sewerFixedFee": number, // Sewer Fixed Fee
            "tierStructure": "Short text summary of tiers or sewer cap info"
        }
        
        If you absolutely cannot find data, return null.`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown
        const jsonString = text.replace(/```json\n|\n```|```/g, "").trim();

        if (jsonString.toLowerCase() === "null") return null;

        const data = JSON.parse(jsonString);
        const parsed = RateSchema.parse(data);

        return {
            providerName: parsed.providerName,
            ratePerUnit: parsed.ratePerUnit,
            sewerRatePerUnit: parsed.sewerRatePerUnit,
            unitType: parsed.unitType === "CCF" ? "HCF" : parsed.unitType, // Normalize CCF -> HCF
            fixedBaseFee: parsed.fixedBaseFee,
            sewerFixedFee: parsed.sewerFixedFee,
            tierStructure: parsed.tierStructure,
            isEstimate: true // AI data is always an estimate/lookup
        };

    } catch (error) {
        console.error(`Error finding water rates for ${city}:`, error);
        return null;
    }
}
