import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const ExtractionSchema = z.object({
    billing_period: z.string().nullable().describe("The billing period range, e.g. 'YYYY-MM-DD to YYYY-MM-DD'"),
    meter_read_start: z.number().nullable().optional().describe("The previous meter reading"),
    meter_read_end: z.number().nullable().optional().describe("The current meter reading"),
    raw_usage_value: z.number().nullable().describe("The usage value exactly as shown on the bill"),
    raw_usage_unit: z.string().nullable().describe("The unit found on the bill (e.g. HCF, CCF, GAL, UNITS)"),
    calculated_gallons: z.number().nullable().describe("Total usage converted to Gallons"),
    total_bill_amount: z.number().nullable().describe("Total amount due"),
    warning_flag: z.string().nullable().optional().describe("Any warnings like ZERO_USAGE_DETECTED"),
    vendor_name: z.string().nullable().optional().describe("Name of the utility vendor"),
    document_type: z.enum(["BILL", "PNL", "UNKNOWN"]).describe("Type of document uploaded"),
    water_cost_amount: z.number().nullable().optional().describe("Total water/sewer line item cost if found on P&L"),
    washer_income_amount: z.number().nullable().optional().describe("Specific line item for Washer/Laundry revenue (excluding Vending/Dryer if possible)"),
});

export type ExtractedData = z.infer<typeof ExtractionSchema>;

export async function processBill(fileBuffer: Buffer, mimeType: string = "application/pdf"): Promise<ExtractedData> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `You are a forensic utility auditor. Your job is to extract water usage or cost data with extreme precision.

    Step 1: Classify Document Type
    - If the document looks like a standard Utility Bill (meter readings, breakdown), Type = "BILL".
    - If the document is a Profit & Loss Statement, Income Statement, or Financial Report, Type = "PNL".

    Step 2: Extraction Rules

    [IF BILL]
    1. Find the Unit: Keywords like 'Gallons', 'GAL', 'HCF', 'CCF', or 'Units'.
       - 'HCF'/'CCF' -> calculated_gallons = value * 748.
       - 'Units' -> assume 748 gallons unless specified.
    2. Verify readings: (Current - Previous) * Multiplier. Prioritize meter math over text if disjoint.
    3. If Usage is 0 but Bill > $0, flag as 'Fixed Fees Only'.
    
    [IF PNL]
    1. Scan for line items: "Water", "Water & Sewer", "Utilities - Water".
    2. Extract the dollar amount for that line item into 'water_cost_amount'.
    3. Scan for line items: "Washer Income", "Laundry Revenue", "Machine Income", "Wash Revenue".
       - If found, extract into 'washer_income_amount'.
       - Try to exclude "Vending", "Dryer", or "Soap" income if listed separately.
    4. Set raw_usage_value = 0 (since volume isn't usually on P&L).

    [COMMON]
    - Extract Vendor Name if visible (e.g. 'City of X Water').
    
    Output Format (JSON):
    {
      "billing_period": "YYYY-MM-DD to YYYY-MM-DD",
      "meter_read_start": number,
      "meter_read_end": number,
      "raw_usage_value": number,
      "raw_usage_unit": "string",
      "calculated_gallons": number,
      "total_bill_amount": number,
      "warning_flag": "string",
      "vendor_name": "string",
      "document_type": "BILL" | "PNL",
      "water_cost_amount": number,
      "washer_income_amount": number
    }`;

    const imagePart = {
        inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType: mimeType,
        },
    };

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present (Gemini sometimes wraps JSON in \`\`\`json ... \`\`\`)
        const jsonString = text.replace(/```json\n|\n```|```/g, "").trim();

        // Parse and validate with Zod
        const parsedData = JSON.parse(jsonString);
        return ExtractionSchema.parse(parsedData);
    } catch (error: any) {
        console.error("Error processing bill with Gemini:", error);
        throw new Error(`Failed to extract data: ${error.message || "Unknown error"}`);
    }
}
