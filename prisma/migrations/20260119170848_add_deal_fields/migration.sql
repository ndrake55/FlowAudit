-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "askingPrice" DECIMAL(12,2),
ADD COLUMN     "claimedMonthlyRevenue" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Machine" ADD COLUMN     "vendPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MachineCycleCount" (
    "id" TEXT NOT NULL,
    "utilityBillId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "MachineCycleCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditReport" (
    "id" TEXT NOT NULL,
    "utilityBillId" TEXT NOT NULL,
    "totalTheoreticalUsage" DOUBLE PRECISION NOT NULL,
    "totalActualUsage" DOUBLE PRECISION NOT NULL,
    "variancePercentage" DOUBLE PRECISION NOT NULL,
    "leakSuspected" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MachineCycleCount_utilityBillId_machineId_key" ON "MachineCycleCount"("utilityBillId", "machineId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditReport_utilityBillId_key" ON "AuditReport"("utilityBillId");

-- AddForeignKey
ALTER TABLE "MachineCycleCount" ADD CONSTRAINT "MachineCycleCount_utilityBillId_fkey" FOREIGN KEY ("utilityBillId") REFERENCES "UtilityBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineCycleCount" ADD CONSTRAINT "MachineCycleCount_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_utilityBillId_fkey" FOREIGN KEY ("utilityBillId") REFERENCES "UtilityBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
