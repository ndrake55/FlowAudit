import { getLocationMachines } from "@/app/actions/audit";
import { getMachineDefinitions } from "@/app/actions/machines";
import { AuditForm } from "@/components/audit/audit-form";
import { BulkAddMachineDialog } from "@/components/machines/bulk-add-machine-dialog";
import { AddMachineDialog } from "@/components/machines/add-machine-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForensicsDashboard } from "@/components/audit/forensics-dashboard";

interface PageProps {
    params: Promise<{
        locationId: string;
    }>;
}

export default async function AuditPage({ params }: PageProps) {
    const { locationId } = await params;

    // Fetch data in parallel
    const [machines, definitions, location] = await Promise.all([
        getLocationMachines(locationId),
        getMachineDefinitions(),

        prisma.location.findUnique({
            where: { id: locationId },
            include: {
                locationIntelligence: true,
                utilityBills: {
                    include: {
                        auditReport: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        })
    ]);

    if (!location) {
        return <div>Location not found</div>;
    }

    // Serialize location to safe JSON types (number instead of Decimal)
    const serializedLocation = {
        ...location,
        askingPrice: location.askingPrice?.toNumber() ?? null,
        claimedMonthlyRevenue: location.claimedMonthlyRevenue?.toNumber() ?? null,
        utilityBills: location.utilityBills.map(bill => ({
            ...bill,
            totalCost: bill.totalCost.toNumber(),
        }))
    };

    const latestBill = location.utilityBills[0];
    const actualMonthlyEnergyCost = latestBill ? latestBill.totalCost.toNumber() : null;

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{location.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            Audit Cockpit
                            {location.address && <span className="text-xs bg-muted px-2 py-0.5 rounded">{location.address}, {location.zipCode}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <AddMachineDialog
                        locations={[serializedLocation]}
                        definitions={definitions}
                    />
                    <BulkAddMachineDialog
                        locations={[serializedLocation]}
                        definitions={definitions}
                    />
                </div>
            </div>

            <Tabs defaultValue="audit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="audit">Operational Audit</TabsTrigger>
                    <TabsTrigger value="forensics">Market & Forensics</TabsTrigger>
                </TabsList>

                <TabsContent value="audit" className="mt-6">
                    <AuditForm
                        locationId={locationId}
                        machines={machines}
                        initialResult={
                            latestBill?.auditReport ? {
                                ...latestBill.auditReport,
                                isLocked: latestBill.auditReport.paymentStatus === 'UNPAID',
                                // Map database fields to the structure expected by the frontend component
                                totalTheoreticalUsage: latestBill.auditReport.totalTheoreticalUsage,
                                totalActualUsage: latestBill.auditReport.totalActualUsage,
                                variance: latestBill.auditReport.variancePercentage,
                                variancePercentage: latestBill.auditReport.variancePercentage,
                                leakSuspected: latestBill.auditReport.leakSuspected,
                                billId: latestBill.id // Needed for payment link
                            } : null
                        }
                    />
                </TabsContent>

                <TabsContent value="forensics" className="mt-6">
                    <ForensicsDashboard
                        location={serializedLocation}
                        intelligence={location.locationIntelligence}
                        actualMonthlyEnergyCost={actualMonthlyEnergyCost}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
