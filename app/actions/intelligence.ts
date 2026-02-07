"use server";

import { findWaterRates } from "@/lib/intelligence/water-rates";

/**
 * Server Action to fetch water rates securely from the client.
 */
export async function getWaterRatesAction(city: string, state: string, zip: string) {
    if (!city || !zip) return null;
    return await findWaterRates(city, state, zip);
}
