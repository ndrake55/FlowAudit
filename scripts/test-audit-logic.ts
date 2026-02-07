import { prisma } from "../lib/prisma";
import { runAudit, submitCycleCounts } from "../app/actions/audit";

async function main() {
    console.log("Starting Audit Logic Verification...");

    // 1. Setup Data
    const tenant = await prisma.tenant.create({
        data: {
            name: "Test Tenant Audit",
            slug: `test-tenant-audit-${Date.now()}`,
        }
    });

    const location = await prisma.location.create({
        data: {
            name: "Test Location Audit",
            tenantId: tenant.id,
        }
    });

    const machineDef = await prisma.machineDefinition.create({
        data: {
            brand: "TestBrand",
            modelNumber: `TB-${Date.now()}`, // Unique
            waterPerCycleGal: 10,
        }
    });

    const machine = await prisma.machine.create({
        data: {
            tenantId: tenant.id,
            locationId: location.id,
            machineDefinitionId: machineDef.id,
        }
    });

    const bill = await prisma.utilityBill.create({
        data: {
            tenantId: tenant.id,
            locationId: location.id,
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-01-31"),
            totalWaterGal: 100, // 10 cycles * 10 gal
            totalCost: 100,
            s3Key: "dummy",
        }
    });

    console.log("Created Test Data. Bill ID:", bill.id);

    // 2. Scenario 1: Perfect Match
    // Submit 10 cycles. Theoretical = 10 * 10 = 100. Actual = 100. Variance = 0.
    console.log("Scenario 1: Submitting 10 cycles (Perfect Match)...");
    await submitCycleCounts(bill.id, [{ machineId: machine.id, count: 10 }]);

    const result1 = await runAudit(bill.id);
    console.log("Audit Result 1:", result1);

    if (Math.abs(result1.variance) < 0.01 && !result1.leakSuspected) {
        console.log("✅ Scenario 1 Passed");
    } else {
        console.error("❌ Scenario 1 Failed");
        process.exit(1);
    }

    // 3. Scenario 2: Leak (High Actual, Low Cycles)
    // Submit 5 cycles. Theoretical = 5 * 10 = 50. Actual = 100. Variance = (100-50)/50 = 100%
    console.log("Scenario 2: Submitting 5 cycles (Leak)...");
    await submitCycleCounts(bill.id, [{ machineId: machine.id, count: 5 }]);

    const result2 = await runAudit(bill.id);
    console.log("Audit Result 2:", result2);

    if (result2.variance > 99 && result2.leakSuspected) {
        console.log("✅ Scenario 2 Passed");
    } else {
        console.error("❌ Scenario 2 Failed");
        process.exit(1);
    }

    // 4. Clean up (Optional, but good practice to remove strict unique constraint items if needed)
    console.log("Verification Complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
