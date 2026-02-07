
import path from 'path';
import dotenv from 'dotenv';

// Load .env explicitly from root
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

async function main() {
    // Import after env load
    const { fetchPropertyDetails, fetchMarketTrends, fetchCommercialRent } = await import('../lib/intelligence/rentcast');
    const { fetchDemographics } = await import('../lib/intelligence/census');
    const { findWaterRates } = await import('../lib/intelligence/water-rates');

    const address = "15055 Vista Rd";
    const city = "Helendale";
    const state = "CA";
    const zip = "92342";

    console.log(`Gathering Intelligence for: ${address}, ${city}, ${state} ${zip}...\n`);

    try {
        console.log("--- 1. RENTCAST PROPERTY DETAILS ---");
        const property = await fetchPropertyDetails(address, city, state, zip);
        console.log(JSON.stringify(property, null, 2));

        console.log("\n--- 2. RENTCAST MARKET TRENDS ---");
        const market = await fetchMarketTrends(zip);
        console.log(JSON.stringify(market, null, 2));

        console.log("\n--- 3. RENTCAST COMMERCIAL RENT ---");
        const commRent = await fetchCommercialRent(zip);
        console.log(`Commercial/Industrial Average Rent: ${commRent}`);

        console.log("\n--- 4. CENSUS DEMOGRAPHICS ---");
        const demographics = await fetchDemographics(zip);
        console.log(JSON.stringify(demographics, null, 2));

        console.log("\n--- 5. WATER RATES (STUB) ---");
        const water = await findWaterRates(city, state, zip);
        console.log(JSON.stringify(water, null, 2));

    } catch (e) {
        console.error("Error executing intelligence script:", e);
    }
}

main();
