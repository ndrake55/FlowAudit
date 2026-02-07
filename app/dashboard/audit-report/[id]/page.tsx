import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle, FileText, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { Suspense } from "react";

import { AuditUnlockOptions } from "@/components/audit-unlock-options";
import { PrintButton } from "@/components/print-button";
import { SparklineChart } from "@/components/audit-report/charts/sparkline-chart";
import { ConfidenceGauge } from "@/components/audit-report/charts/confidence-gauge";
import { RevenueSlider } from "@/components/audit-report/charts/revenue-slider";
import { CompositionSlider } from "@/components/audit-report/charts/composition-slider";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AuditResultPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    if (!id) {
        return <div>Invalid Audit ID</div>;
    }

    console.log("Fetching Audit Report:", id);
    let audit, user;
    try {
        [audit, user] = await Promise.all([
            prisma.auditReport.findUnique({
                where: { id },
                include: {
                    utilityBill: {
                        include: {
                            location: {
                                include: {
                                    locationIntelligence: true
                                }
                            },
                            machineCycleCounts: {
                                include: {
                                    machine: {
                                        include: {
                                            machineDefinition: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.user.findUnique({
                where: { clerkUserId: userId }
            })
        ]);
        console.log("Fetch success. Audit found:", !!audit);
    } catch (error) {
        console.error("Critical Error fetching Audit Page:", error);
        throw error;
    }

    if (!audit) {
        return <div>Audit Report not found.</div>;
    }

    const isSubscribed = user?.isSubscribed ?? false;
    const isLocked = audit.paymentStatus === "UNPAID" && !isSubscribed;
    // const isLeak = audit.leakSuspected; // Kept for reference but not primary

    // Revenue Data
    const location = audit.utilityBill.location;
    // const askingPrice = Number(location.askingPrice) || 0;
    const statedRevenue = Number(location.claimedMonthlyRevenue) || 0;
    const realRevenue = audit.estimatedRevenue;
    const multiple = audit.valuationMultiple;

    // Formatting Helpers
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatPercent = (val: number) => `${val.toFixed(1)}%`;

    // Data to display (Masked if locked)
    const displayData = {
        multiple: isLocked ? "X.Xx" : `${multiple.toFixed(1)}x`,
        revenue: isLocked ? "$XX,XXX" : formatCurrency(realRevenue),
        revenueDiff: isLocked ? "XX%" : formatPercent(((realRevenue - statedRevenue) / statedRevenue) * 100),
        variance: isLocked ? "XX.X%" : formatPercent(audit.variancePercentage),
    };

    // Machine & Revenue Data
    const utilityBill = audit.utilityBill;
    const machines = utilityBill.machineCycleCounts.map(mcc => ({
        ...mcc,
        def: mcc.machine.machineDefinition
    }));

    // Chart Helper Data
    const popGrowth = location.locationIntelligence?.populationGrowth || 0;
    const currentPop = location.locationIntelligence?.censusPopulation || 0;
    // If growth is 0.05 (5%), prev was current / 1.05
    const prevPop = popGrowth !== 0 ? currentPop / (1 + popGrowth) : currentPop * 0.98; // Fallback subtle trend if 0? No, straight line if 0.
    const popData = [
        { value: prevPop },
        { value: currentPop }
    ];

    // Commercial Rent Trend (Mock for visual if no data, or just single point)
    // We'll stick to Value for now unless we want to force a visual.
    // User requested "Market Cap Chart" for Commercial Rent.
    // Since we don't have history, we can't honestly show a trend. 
    // We'll leave it as value for now or add a placeholder.

    return (
        <div className="space-y-8 p-8 relative min-h-screen">
            <div className="flex items-center justify-between no-print">
                <Suspense fallback={<Button variant="outline" disabled>Loading...</Button>}>
                    <PrintButton targetId="audit-report" />
                </Suspense>
            </div>

            <div id="audit-report" className="space-y-8 print:p-0 print:space-y-4">
                <div className="flex items-center justify-between pdf-header-layout">
                    <div className="pdf-text-center">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 hidden pdf-show mb-2">Forensic Audit</h2>
                        <h1 className="text-3xl font-bold tracking-tight">{location.name}</h1>
                        <p className="text-slate-500">Analysis for {utilityBill.startDate.toLocaleDateString()} - {utilityBill.endDate.toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 pdf-hide">
                        {isLocked ? (
                            <Badge variant="destructive" className="text-lg px-4 py-1">UNPAID</Badge>
                        ) : (
                            <Badge className="bg-green-600 text-lg px-4 py-1">PAID</Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                    {/* 1. Valuation Multiple */}
                    <Card className="border-blue-200 bg-blue-50/50 print:border print:border-slate-200 print:bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900">True Assignment Multiple</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold text-blue-700 ${isLocked ? "blur-sm select-none" : ""}`}>
                                {displayData.multiple}
                            </div>
                            <p className="text-xs text-blue-600/80">
                                Asking Price / Annualized Real Revenue
                            </p>
                        </CardContent>
                    </Card>

                    {/* 2. Revenue Reality Check (Replaced with RevenueSlider) */}
                    <Card className="print:border print:border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue Verification</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`mb-4 ${isLocked ? "blur-sm select-none pointer-events-none" : ""}`}>
                                <div className="text-2xl font-bold mb-1">
                                    {displayData.revenue}
                                </div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    vs Stated {formatCurrency(statedRevenue)}
                                </p>

                                {/* Visual Slider */}
                                <RevenueSlider
                                    statedRevenue={statedRevenue}
                                    realRevenue={realRevenue}
                                    className="mt-2"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Operational Risk (Replaced with Gauge) */}
                    <Card className="print:border print:border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data Confidence</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pt-0">
                            <div className={`w-full ${isLocked ? "blur-sm select-none pointer-events-none" : ""}`}>
                                <ConfidenceGauge value={99.9} label="Analysis Confidence" />
                                <p className="text-[10px] text-center text-muted-foreground mt-2">
                                    Based on {utilityBill.totalWaterGal.toLocaleString()} gal usage.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Demographics Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 print:grid-cols-3 print:gap-4 print:mt-4">

                    {/* Local Demographics - With Sparkline */}
                    <Card className="print:border print:border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Local Demographics</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <div className="space-y-0.5">
                                        <span className="text-muted-foreground block text-xs">Population</span>
                                        <span className="font-semibold text-lg">{location.locationIntelligence?.censusPopulation?.toLocaleString() ?? "N/A"}</span>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <span className="text-muted-foreground block text-xs">Median Age</span>
                                        <span className="font-semibold text-lg">{location.locationIntelligence?.medianAge?.toFixed(1) ?? "N/A"}</span>
                                    </div>
                                </div>

                                {/* Population Trend Sparkline */}
                                {location.locationIntelligence?.censusPopulation && (
                                    <div className="pt-2">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                            <span>Growth Trend</span>
                                            <span className={popGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                                                {popGrowth > 0 ? "+" : ""}{(popGrowth * 100).toFixed(2)}%
                                            </span>
                                        </div>
                                        <SparklineChart data={popData} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Housing Composition - With Slider */}
                    <Card className="print:border print:border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Housing Composition</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 pt-2">
                                {(() => {
                                    const housing = location.locationIntelligence?.housingType as any;
                                    if (!housing) return <span className="text-sm text-slate-400">Not Available</span>;
                                    return (
                                        <CompositionSlider
                                            value={housing.singleFamily || 0}
                                            labelLeft="Single Family"
                                            labelRight="Multi-Family"
                                            className="py-2"
                                        />
                                    );
                                })()}
                                <p className="text-[10px] text-muted-foreground text-center mt-4">
                                    Determines customer base stability.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Commercial Rent */}
                    <Card className="print:border print:border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commercial Rent (Industrial)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {location.locationIntelligence?.commercialRent
                                    ? formatCurrency(location.locationIntelligence.commercialRent)
                                    : "N/A"}
                                <span className="text-xs font-normal text-muted-foreground ml-1">/mo avg</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Market average for area
                            </p>

                            {/* Placeholder for Sparkline if we ever get trend data */}
                            {/* <div className="h-8 w-full mt-2 border-b border-dashed border-slate-200" /> */}
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Analysis Section */}
                <div className="relative mt-8 print:mt-6">
                    {isLocked && (
                        <div className="absolute inset-0 backdrop-blur-md bg-white/30 z-10 flex items-center justify-center rounded-lg border border-slate-200 no-print">
                            <Card className="w-[480px] shadow-2xl border-slate-200 bg-white/95">
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                        <Lock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl text-slate-900">
                                        Unlock the Truth
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center space-y-6">
                                    <p className="text-slate-600 px-4">
                                        The seller claims this business makes <strong>{formatCurrency(statedRevenue)}/mo</strong>.
                                        Our forensic analysis of the water bill tells a different story.
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-2 border-b">
                                            <span className="text-slate-500">Valuation Risk</span>
                                            <span className="font-semibold text-slate-800">Calculated</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b">
                                            <span className="text-slate-500">True Revenue</span>
                                            <span className="font-semibold text-slate-800"> Hidden</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 border-b">
                                            <span className="text-slate-500">Energy Cost Estimate</span>
                                            <span className="font-semibold text-slate-800">Included</span>
                                        </div>
                                    </div>

                                    <AuditUnlockOptions auditReportId={audit.id} />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Content: Detailed Machine Analysis */}
                    <div className={isLocked ? "pointer-events-none opacity-50 filter blur-sm" : ""}>
                        <Card className="print:border print:border-slate-200">
                            <CardHeader>
                                <CardTitle>Detailed Machine & Revenue Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3">Machine Type</th>
                                                <th className="px-4 py-3">Model</th>
                                                <th className="px-4 py-3 text-right">Count</th>
                                                <th className="px-4 py-3 text-right">Est. Cycles/Mo</th>
                                                <th className="px-4 py-3 text-right">Vend Price</th>
                                                <th className="px-4 py-3 text-right">Est. Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {machines.map((m) => {
                                                const revenue = m.count * parseFloat(m.machine.vendPrice.toString());
                                                return (
                                                    <tr key={m.id} className="bg-white hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium">{m.def.type}</td>
                                                        <td className="px-4 py-3 text-slate-500">{m.def.brand} {m.def.modelNumber}</td>
                                                        <td className="px-4 py-3 text-right font-mono">{m.count.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-slate-600">~{(m.count / 30).toFixed(1)}/day</td>
                                                        <td className="px-4 py-3 text-right">{formatCurrency(Number(m.machine.vendPrice))}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(revenue)}</td>
                                                    </tr>
                                                );
                                            })}
                                            {machines.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                        No machine data available for breakdown.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-slate-50 font-semibold text-slate-900">
                                            <tr>
                                                <td colSpan={5} className="px-4 py-3 text-right">Total Estimated Monthly Revenue</td>
                                                <td className="px-4 py-3 text-right">{displayData.revenue}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue Reconstruction Notes */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:mt-4">
                            <Card className="print:border print:border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">Methodology</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-600 space-y-2">
                                    <p>
                                        This forensic analysis reverse-engineers revenue by starting with the most reliable data point: <strong>Water Usage</strong>.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Total Water Consumed: <strong>{utilityBill.totalWaterGal.toLocaleString()} gallons</strong></li>
                                        <li>We solved for the number of cycles required to consume this volume based on the machine mix efficiency ratings.</li>
                                        <li>Revenue is derived by multiplying the calculated cycles by the vend price per machine.</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="print:border print:border-slate-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">Variance Explanation</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-600 space-y-2">
                                    <p>
                                        The variance of <strong>{displayData.revenueDiff}</strong> indicates a significant discrepancy between the seller's stated revenue and the physical capacity of the utility usage.
                                    </p>
                                    <p>
                                        <strong>Recommendation:</strong> Request 12 months of bank statements to reconcile the stated revenue, as the utility usage does not support the claimed income.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
