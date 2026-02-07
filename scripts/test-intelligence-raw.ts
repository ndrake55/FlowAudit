
import path from 'path';
import dotenv from 'dotenv';
import { z } from "zod";

// Load .env explicitly from root
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Simple env access (since we can't easily use lib/env.ts if it depends on Next.js constructs, though it likely doesn't. 
// But let's just use process.env to be safe and raw)
const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
const CENSUS_API_KEY = process.env.CENSUS_API_KEY;

const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";
const CENSUS_BASE_URL = "https://api.census.gov/data/2021/acs/acs5";

// Census Vars
const VAR_MEDIAN_INCOME = "B19013_001E";
const VAR_POPULATION = "B01003_001E";
const VAR_MEDIAN_AGE = "B01002_001E";
const VAR_HOUSING_TOTAL = "B25024_001E";
const VAR_HOUSING_1_UNIT_DETACHED = "B25024_002E";
const VAR_HOUSING_1_UNIT_ATTACHED = "B25024_003E";

async function fetchPropertyDetailsRaw(address: string, city: string, state: string, zip: string) {
    if (!RENTCAST_API_KEY) {
        console.warn("RENTCAST_API_KEY is missing.");
        return null;
    }

    const params = new URLSearchParams({ address, city, state, zip });
    const url = `${RENTCAST_BASE_URL}/properties?${params.toString()}`;

    console.log(`Fetching: ${url}`);

    const res = await fetch(url, {
        headers: { "X-Api-Key": RENTCAST_API_KEY, "accept": "application/json" }
    });

    if (!res.ok) {
        console.error(`RentCast Error: ${res.status} ${res.statusText}`);
        return null;
    }

    const data = await res.json();
    const property = data[0];
    if (!property) return null;

    // formatted output similar to lib
    const taxAssessments = property.taxAssessments ?
        Object.entries(property.taxAssessments).map(([year, val]: [string, any]) => ({
            year: parseInt(year),
            value: val.value,
            land: val.land,
            improvements: val.improvements
        })).sort((a: any, b: any) => b.year - a.year)
        : [];

    return {
        taxAssessments: taxAssessments.slice(0, 3), // Limit to top 3 for brevity in log
        lastSalePrice: property.lastSalePrice,
        lastSaleDate: property.lastSaleDate,
        squareFootage: property.squareFootage,
        yearBuilt: property.yearBuilt,
        propertyType: property.propertyType,
        legalDescription: property.legalDescription
    };
}

async function fetchMarketTrendsRaw(zip: string) {
    if (!RENTCAST_API_KEY) return null;

    // Try Industrial first
    let url = `${RENTCAST_BASE_URL}/markets/averages?zip=${zip}&propertyType=Industrial`;
    let res = await fetch(url, {
        headers: { "X-Api-Key": RENTCAST_API_KEY, "accept": "application/json" }
    });

    let data;
    if (res.ok) {
        data = await res.json();
    }

    // If no industrial data, try Multi-Family
    if (!data || !data.averageRent) {
        console.log("No Industrial data, trying Multi-Family...");
        url = `${RENTCAST_BASE_URL}/markets/averages?zip=${zip}&propertyType=Multi-Family`;
        res = await fetch(url, {
            headers: { "X-Api-Key": RENTCAST_API_KEY, "accept": "application/json" }
        });
        if (res.ok) data = await res.json();
    }

    if (!data) return null;

    return {
        marketRent: data.averageRent,
        marketRentPsf: data.averageRent / (data.averageSquareFootage || 1000),
        propertyType: data.propertyType || "Mixed"
    };
}

async function fetchDemographicsRaw(zip: string) {
    // const keyParam = CENSUS_API_KEY ? `&key=${CENSUS_API_KEY}` : "";
    const keyParam = ""; // Try without key

    // Core
    const urlBasic = `${CENSUS_BASE_URL}?get=${VAR_MEDIAN_INCOME},${VAR_POPULATION},${VAR_MEDIAN_AGE}&for=zip%20code%20tabulation%20area:${zip}${keyParam}`;
    console.log(`Fetching Census Basic: ${urlBasic}`);

    const resBasic = await fetch(urlBasic);
    const textBasic = await resBasic.text();

    if (!resBasic.ok) {
        console.error(`Census Basic failed (${resBasic.status}): ${textBasic.slice(0, 500)}`);
        return "Census Fetch Failed";
    }

    let dataBasic;
    try {
        dataBasic = JSON.parse(textBasic);
    } catch (e) {
        console.error(`Census JSON Parse Error. Response: ${textBasic.slice(0, 500)}`);
        return "Census Data Invalid";
    }

    if (!Array.isArray(dataBasic) || dataBasic.length < 2) return "No Census Data Found";

    const hBasic = dataBasic[0];
    const vBasic = dataBasic[1];

    const medianIncome = parseInt(vBasic[hBasic.indexOf(VAR_MEDIAN_INCOME)]);
    const population = parseInt(vBasic[hBasic.indexOf(VAR_POPULATION)]);
    const medianAge = parseFloat(vBasic[hBasic.indexOf(VAR_MEDIAN_AGE)]);

    return {
        medianIncome,
        population,
        medianAge,
        housingType: "Data pending (Housing fetch skipped for debug)"
    };
}

async function main() {
    console.log("=== INTELLIGENCE REPORT FOR: 15055 Vista Rd, Helendale, CA 92342 ===\n");

    const address = "15055 Vista Rd";
    const city = "Helendale";
    const state = "CA";
    const zip = "92342";

    const property = await fetchPropertyDetailsRaw(address, city, state, zip);
    console.log("1. PROPERTY DETAILS:");
    console.log(JSON.stringify(property, null, 2));

    const market = await fetchMarketTrendsRaw(zip);
    console.log("\n2. MARKET INTELLIGENCE (Zip 92342):");
    console.log(JSON.stringify(market, null, 2));

    const demo = await fetchDemographicsRaw(zip);
    console.log("\n3. DEMOGRAPHICS (Zip 92342):");
    console.log(JSON.stringify(demo, null, 2));

    console.log("\n4. WATER RATES:");
    console.log("Result: NULL (Manual Entry Required)");
}

main();
