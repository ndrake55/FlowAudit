import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";

const CENSUS_BASE_URL = "https://api.census.gov/data/2021/acs/acs5"; // Using 2021 ACS 5-Year as a stable baseline, update to latest if needed

// Variables
const VAR_MEDIAN_INCOME = "B19013_001E";
const VAR_POPULATION = "B01003_001E";
const VAR_MEDIAN_AGE = "B01002_001E";
const VAR_HOUSING_TOTAL = "B25024_001E";
const VAR_HOUSING_1_UNIT_DETACHED = "B25024_002E";
const VAR_HOUSING_1_UNIT_ATTACHED = "B25024_003E";
// 2+ units implies multi-family/apartments
const VAR_HOUSING_2_UNITS = "B25024_004E";
const VAR_HOUSING_3_OR_4 = "B25024_005E";
const VAR_HOUSING_5_TO_9 = "B25024_006E";
const VAR_HOUSING_10_TO_19 = "B25024_007E";
const VAR_HOUSING_20_TO_49 = "B25024_008E";
const VAR_HOUSING_50_PLUS = "B25024_009E";

const NATIONAL_AVERAGE = {
    medianIncome: 70784,
    population: 30000,
    medianAge: 38.8,
    populationGrowth: 0,
    housingType: { singleFamily: 0.65, multiFamily: 0.35 },
    isFallback: true
};

export async function fetchDemographics(zipCode: string) {
    return unstable_cache(
        async () => {
            try {
                const keyParam = env.CENSUS_API_KEY ? `&key=${env.CENSUS_API_KEY}` : "";

                // Fetch Core Demographics (Income, Pop, Age)
                const urlBasic = `${CENSUS_BASE_URL}?get=${VAR_MEDIAN_INCOME},${VAR_POPULATION},${VAR_MEDIAN_AGE}&for=zip%20code%20tabulation%20area:${zipCode}${keyParam}`;

                // Fetch Housing (Separate call or combined? URL length limits exist. Split needed generally for long lists)
                // Let's try combining reasonably.
                const housingVars = [VAR_HOUSING_TOTAL, VAR_HOUSING_1_UNIT_DETACHED, VAR_HOUSING_1_UNIT_ATTACHED, VAR_HOUSING_2_UNITS, VAR_HOUSING_3_OR_4, VAR_HOUSING_5_TO_9, VAR_HOUSING_10_TO_19, VAR_HOUSING_20_TO_49, VAR_HOUSING_50_PLUS].join(",");
                const urlHousing = `${CENSUS_BASE_URL}?get=${housingVars}&for=zip%20code%20tabulation%20area:${zipCode}${keyParam}`;

                const [resBasic, resHousing] = await Promise.all([
                    fetch(urlBasic, { next: { revalidate: 60 * 60 * 24 * 30 } }),
                    fetch(urlHousing, { next: { revalidate: 60 * 60 * 24 * 30 } })
                ]);

                if (!resBasic.ok || !resHousing.ok) return NATIONAL_AVERAGE;

                const dataBasic = await resBasic.json();
                const dataHousing = await resHousing.json();

                if (!Array.isArray(dataBasic) || dataBasic.length < 2) return NATIONAL_AVERAGE;

                // Parse Basic
                const hBasic = dataBasic[0];
                const vBasic = dataBasic[1];
                const medianIncome = parseInt(vBasic[hBasic.indexOf(VAR_MEDIAN_INCOME)]) || 0;
                const population = parseInt(vBasic[hBasic.indexOf(VAR_POPULATION)]) || 0;
                const medianAge = parseFloat(vBasic[hBasic.indexOf(VAR_MEDIAN_AGE)]) || 0;

                // Parse Housing
                let housingType = { singleFamily: 0, multiFamily: 0 };
                if (Array.isArray(dataHousing) && dataHousing.length >= 2) {
                    const hHouse = dataHousing[0];
                    const vHouse = dataHousing[1];

                    const getVal = (v: string) => parseInt(vHouse[hHouse.indexOf(v)]) || 0;

                    const totalUnits = getVal(VAR_HOUSING_TOTAL);
                    const singleUnits = getVal(VAR_HOUSING_1_UNIT_DETACHED) + getVal(VAR_HOUSING_1_UNIT_ATTACHED);
                    const multiUnits = totalUnits - singleUnits; // Simplified

                    if (totalUnits > 0) {
                        housingType = {
                            singleFamily: Number((singleUnits / totalUnits).toFixed(2)),
                            multiFamily: Number((multiUnits / totalUnits).toFixed(2))
                        };
                    }
                }

                return {
                    medianIncome,
                    population,
                    medianAge,
                    populationGrowth: 0, // Requires historical data (complex) default 0 for now
                    housingType,
                    isFallback: false
                };

            } catch (error) {
                console.error("Error fetching Census data:", error);
                return NATIONAL_AVERAGE;
            }
        },
        [`census-demographics-v2-${zipCode}`],
        { tags: ["census"], revalidate: 60 * 60 * 24 * 30 }
    )();
}
