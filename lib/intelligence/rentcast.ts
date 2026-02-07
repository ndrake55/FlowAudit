import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";

const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";

export interface PropertyTax {
    year: number;
    value: number;
    land?: number;
    improvements?: number;
}

export interface MarketTrend {
    averageRent: number;
    minRent: number;
    maxRent: number;
    propertyType: string;
    bedrooms: number;
}

// Cache tag for revalidation if needed
const CACHE_TAG = "rentcast-data";

export async function fetchPropertyDetails(address: string, city?: string, state?: string, zip?: string) {
    // Use unstable_cache to cache the result
    return unstable_cache(
        async () => {
            if (!env.RENTCAST_API_KEY) {
                console.warn("RENTCAST_API_KEY is missing. Returning null.");
                return null;
            }

            try {
                const params = new URLSearchParams({
                    address,
                });
                if (city) params.append("city", city);
                if (state) params.append("state", state);
                if (zip) params.append("zip", zip);

                const response = await fetch(`${RENTCAST_BASE_URL}/properties?${params.toString()}`, {
                    headers: {
                        "X-Api-Key": env.RENTCAST_API_KEY,
                        "accept": "application/json",
                    },
                    next: { revalidate: 60 * 60 * 24 * 7 } // Cache for 7 days
                });

                if (!response.ok) {
                    if (response.status === 404) return null;
                    throw new Error(`RentCast API error: ${response.statusText}`);
                }

                const data = await response.json();
                // RentCast returns an array of matches. take the first one.
                const property = data[0];

                if (!property) return null;

                // Extract tax history
                // RentCast property object usually has 'taxAssessments' object or array
                // Adjust based on actual API response structure. 
                // Assuming property.taxAssessments is mapped correctly.
                const taxAssessments: PropertyTax[] = property.taxAssessments ?
                    Object.entries(property.taxAssessments).map(([year, val]: [string, any]) => ({
                        year: parseInt(year),
                        value: val.value,
                        land: val.land,
                        improvements: val.improvements
                    })).sort((a: any, b: any) => b.year - a.year)
                    : [];

                return {
                    taxAssessments,
                    lastSalePrice: property.lastSalePrice,
                    lastSaleDate: property.lastSaleDate,
                    squareFootage: property.squareFootage,
                    yearBuilt: property.yearBuilt,
                    propertyType: property.propertyType,
                    legalDescription: property.legalDescription
                };

            } catch (error) {
                console.error("Error fetching RentCast property details:", error);
                return null; // Fail gracefully
            }
        },
        [`rentcast-property-${address}-${zip}`],
        { tags: [CACHE_TAG], revalidate: 60 * 60 * 24 * 7 }
    )();
}

export async function fetchMarketTrends(zipCode: string) {
    return unstable_cache(
        async () => {
            if (!env.RENTCAST_API_KEY) return null;

            try {
                // Endpoint for market averages (using /markets/averages or similar)
                const response = await fetch(`${RENTCAST_BASE_URL}/markets/averages?zip=${zipCode}&propertyType=Industrial`, { // Assuming Industrial/Commercial for "FlowAudit" context (Laundry?)
                    headers: {
                        "X-Api-Key": env.RENTCAST_API_KEY,
                        "accept": "application/json",
                    },
                    next: { revalidate: 60 * 60 * 24 * 7 }
                });

                if (!response.ok) return null;

                const data = await response.json();

                // Look for appropriate data point. Returning raw data or simplified metric.
                // Assuming response has 'rent' field
                return {
                    marketRent: data.averageRent,
                    marketRentPsf: data.averageRent / (data.averageSquareFootage || 2000), // Approximate if sqft missing, or use specific per-sqft endpoint if available
                };
            } catch (error) {
                console.error("Error fetching RentCast market trends:", error);
                return null;
            }
        },
        [`rentcast-trends-${zipCode}`],
        { tags: [CACHE_TAG], revalidate: 60 * 60 * 24 * 7 }
    )();
}

export async function fetchCommercialRent(zipCode: string) {
    return unstable_cache(
        async () => {
            if (!env.RENTCAST_API_KEY) return null;

            try {
                // "Industrial" covers warehouses/laundromats often.
                const response = await fetch(`${RENTCAST_BASE_URL}/markets/averages?zip=${zipCode}&propertyType=Industrial`, {
                    headers: {
                        "X-Api-Key": env.RENTCAST_API_KEY,
                        "accept": "application/json",
                    },
                    next: { revalidate: 60 * 60 * 24 * 7 }
                });

                if (!response.ok) return null;
                const data = await response.json();

                // RentCast returns annual or monthly? Usually monthly.
                return data.averageRent || null;

            } catch (error) {
                console.error("Error fetching commercial rent:", error);
                return null;
            }
        },
        [`rentcast-market-${zipCode}`],
        { tags: [CACHE_TAG], revalidate: 60 * 60 * 24 * 7 }
    )();
}
