
// EUI Factors (kBTU/sqft) - Simplified lookup based on CBECS
const EUI_FACTORS: Record<string, number> = {
    "Laundromat": 45, // High intensity
    "Dry Cleaner": 35,
    "Retail": 15,
    "Office": 12,
    "Warehouse": 8,
    "Other": 20
};

// Age Penalty: +1% per year > 20 years old, max 50%
const BASE_YEAR = 2024;
const AGE_PENALTY_THRESHOLD = 20;

export function predictEnergyUsage(sqFt: number, yearBuilt: number, buildingType: string = "Laundromat") {
    const euiFactor = EUI_FACTORS[buildingType] || EUI_FACTORS["Other"];

    const age = BASE_YEAR - yearBuilt;
    let agePenalty = 0;

    if (age > AGE_PENALTY_THRESHOLD) {
        agePenalty = Math.min((age - AGE_PENALTY_THRESHOLD) * 0.01, 0.50);
    }

    // Adjusted EUI
    const adjustedEUI = euiFactor * (1 + agePenalty);

    // Total Annual Energy (kBTU)
    const totalAnnualkBTU = sqFt * adjustedEUI;

    // Convert kBTU to kWh (1 kBTU approx 0.293 kWh)
    const totalAnnualkWh = totalAnnualkBTU * 0.293071;

    const monthlykWh = totalAnnualkWh / 12;

    // Estimated Cost ($0.15/kWh default)
    const costPerkWh = 0.15;
    const monthlyCost = monthlykWh * costPerkWh;

    return {
        originalEUI: euiFactor,
        agePenalty,
        adjustedEUI,
        monthlykWh,
        monthlyCost
    };
}
