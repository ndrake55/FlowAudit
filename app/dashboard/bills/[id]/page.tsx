import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CycleCountForm } from "@/components/audit/cycle-count-form";
import { PaywallCard } from "@/components/audit/paywall-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BillDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function BillDetailsPage({ params }: BillDetailsPageProps) {
    const { id } = await params;

    const bill = await prisma.utilityBill.findUnique({
        where: { id },
        include: {
            location: true,
            auditReport: true,
            machineCycleCounts: true,
        },
    });

    if (!bill) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

    // Fetch machines for this location
    const machines = await prisma.machine.findMany({
        where: { locationId: bill.locationId },
        include: {
            machineDefinition: true,
        },
        orderBy: {
            machineDefinition: {
                modelNumber: 'asc',
            }
        }
    });

    // Map existing counts for the form
    const initialCounts: Record<string, number> = {};
    for (const count of bill.machineCycleCounts) {
        initialCounts[count.machineId] = count.count;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Bill Details</h1>
                <p className="text-muted-foreground">
                    {bill.location.name} • {new Date(bill.startDate).toLocaleDateString()} - {new Date(bill.endDate).toLocaleDateString()}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Bill Info & Audit Results */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bill Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Water Usage</span>
                                <span className="font-medium">{bill.totalWaterGal.toLocaleString()} Gal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Cost</span>
                                <span className="font-medium">${Number(bill.totalCost).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {bill.auditReport && (
                        <div className="relative">
                            {(!user?.isSubscribed && bill.auditReport.paymentStatus !== 'PAID') && <PaywallCard />}
                            <Card className={`${(!user?.isSubscribed && bill.auditReport.paymentStatus !== 'PAID') ? "filter blur-sm select-none pointer-events-none" : ""} ${bill.auditReport.leakSuspected ? "border-red-500 bg-red-50/10" : "border-green-500 bg-green-50/10"}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            Audit Result
                                            {(!user?.isSubscribed && bill.auditReport.paymentStatus !== 'PAID') ? (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">Locked</Badge>
                                            ) : (
                                                <Badge variant={bill.auditReport.leakSuspected ? "destructive" : "default"} className={!bill.auditReport.leakSuspected ? "bg-green-600 hover:bg-green-700" : ""}>
                                                    {bill.auditReport.leakSuspected ? "Leak Suspected" : "Passed"}
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        Generated on {new Date(bill.auditReport.createdAt).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Theoretical Usage</span>
                                        <span className="font-medium">{bill.auditReport.totalTheoreticalUsage.toLocaleString()} Gal</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Actual Usage</span>
                                        <span className="font-medium">{bill.auditReport.totalActualUsage.toLocaleString()} Gal</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                        <span className="font-medium">Variance</span>
                                        <span className={`font-bold ${bill.auditReport.leakSuspected ? "text-red-600" : "text-green-600"}`}>
                                            {bill.auditReport.variancePercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column: Cycle Count Entry */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cycle Data Entry</CardTitle>
                        <CardDescription>
                            Enter the cycle counts for each machine during this billing period.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CycleCountForm
                            utilityBillId={bill.id}
                            machines={machines}
                            initialCounts={initialCounts}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
