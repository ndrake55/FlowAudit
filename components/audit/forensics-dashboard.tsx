"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { enrichLocationData } from "@/app/actions/enrich-location";
import { useTransition } from "react";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Assuming this exists or I'll implement inline
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ForensicsDashboardProps {
    location: {
        id: string;
        address?: string | null;
        claimedMonthlyRevenue?: number | null; // serialized Decimal
        sqFt?: number | null;
        yearBuilt?: number | null;
    };
    intelligence: {
        taxAssessments: any;
        marketRentPsf: number | null;
        censusMedianIncome: number | null;
        censusPopulation: number | null;
        predictedEnergyCost: number | null;
        intelligenceLastUpdated: Date | null;
    } | null;
    actualMonthlyEnergyCost?: number | null; // From utility bill
}

export function ForensicsDashboard({ location, intelligence, actualMonthlyEnergyCost }: ForensicsDashboardProps) {
    const [isPending, startTransition] = useTransition();

    const handleEnrich = () => {
        startTransition(async () => {
            await enrichLocationData(location.id);
        });
    };

    if (!intelligence || !intelligence.intelligenceLastUpdated) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10">
                <h3 className="text-lg font-semibold mb-2">No Intelligence Data Available</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Run a forensic analysis to fetch tax history, market rents, demographics, and energy physics data.
                </p>
                <Button onClick={handleEnrich} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Analyzing..." : "Run Forensic Analysis"}
                </Button>
            </div>
        );
    }

    // 1. Tax Logic
    const taxHistory = Array.isArray(intelligence.taxAssessments) ? intelligence.taxAssessments : [];
    const sortedTax = [...taxHistory].sort((a: any, b: any) => a.year - b.year);

    // Calculate CAGR (Compound Annual Growth Rate) if enough data
    let cagr = 0;
    let highTaxGrowth = false;
    if (sortedTax.length >= 2) {
        const start = sortedTax[0].value;
        const end = sortedTax[sortedTax.length - 1].value;
        const years = sortedTax.length - 1;
        if (start > 0 && years > 0) {
            cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
            highTaxGrowth = cagr > 5;
        }
    }

    // 2. Rent Logic
    const claimedRev = location.claimedMonthlyRevenue ?? 0;
    const sqFt = location.sqFt ?? 2000; // fallback
    const marketRentPsf = intelligence.marketRentPsf ?? 0;
    const marketPotentialRev = marketRentPsf * sqFt;
    const isUnderperforming = marketPotentialRev > 0 && claimedRev < (marketPotentialRev * 0.8); // >20% below

    // 3. Demographic Logic
    const income = intelligence.censusMedianIncome ?? 0;
    const isLowIncome = income > 0 && income < 35000;

    // 4. Energy Logic
    const predictedCost = intelligence.predictedEnergyCost ?? 0;
    const actualCost = actualMonthlyEnergyCost ?? 0;
    const isInefficient = actualCost > (predictedCost * 1.3); // >30% over predicted

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Forensic Intelligence</h3>
                    <p className="text-sm text-muted-foreground">
                        Last Updated: {new Date(intelligence.intelligenceLastUpdated).toLocaleDateString()}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleEnrich} disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Refresh Data</span>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Can 1: Tax Liability */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            Tax Liability Check
                            {highTaxGrowth && <Badge variant="destructive">High Growth ({cagr.toFixed(1)}%)</Badge>}
                        </CardTitle>
                        <CardDescription>Assessed Value Progression</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px]">
                        {sortedTax.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sortedTax}>
                                    <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">No Tax Data</div>
                        )}
                    </CardContent>
                </Card>

                {/* Card 2: Rent Reality */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            Rent Reality Check
                            {isUnderperforming && <Badge variant="destructive">Underperforming</Badge>}
                            {!isUnderperforming && marketPotentialRev > 0 && <Badge variant="default" className="bg-green-600">Healthy</Badge>}
                        </CardTitle>
                        <CardDescription>Claimed Revenue vs Market Potential</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b pb-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Claimed Revenue</p>
                                    <p className="text-2xl font-bold">${claimedRev.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Market Reference</p>
                                    <p className="text-lg font-medium">${marketPotentialRev.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">(${marketRentPsf.toFixed(2)}/sqft)</p>
                                </div>
                            </div>
                            {isUnderperforming && (
                                <div className="flex items-center text-red-600 text-sm gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Subject property is {((1 - claimedRev / marketPotentialRev) * 100).toFixed(0)}% below market potential.</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Demographic Viability */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            Demographic Viability
                            {isLowIncome ? <Badge variant="destructive">Low Income</Badge> : <Badge variant="secondary">Standard</Badge>}
                        </CardTitle>
                        <CardDescription>Neighborhood Purchasing Power</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Median Household Income</p>
                                <p className="text-3xl font-bold text-primary">${income.toLocaleString()}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p className="text-muted-foreground">Population</p>
                                <p className="font-medium">{(intelligence.censusPopulation ?? 0).toLocaleString()}</p>
                            </div>
                        </div>
                        {isLowIncome && (
                            <p className="mt-4 text-sm text-destructive font-medium">
                                Warning: Median income is below $35,000 threshold.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Card 4: Energy Efficiency */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            Energy Efficiency Score
                            {isInefficient ? <Badge variant="destructive">Inefficient</Badge> : <Badge variant="default" className="bg-green-600">Efficient</Badge>}
                        </CardTitle>
                        <CardDescription>Physics-Based Consumption Audit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Predicted Bill</p>
                                <p className="text-xl font-bold">${predictedCost.toFixed(0)}</p>
                                <span className="text-xs text-muted-foreground">Model: CBECS {location.yearBuilt ? `(${location.yearBuilt})` : ''}</span>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-xs uppercase text-primary font-semibold">Actual Bill</p>
                                <p className="text-xl font-bold text-primary">${actualCost.toFixed(0)}</p>
                                <span className="text-xs text-muted-foreground">Latest Bill</span>
                            </div>
                        </div>
                        {isInefficient && (
                            <div className="mt-4 flex items-center text-red-600 text-sm gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Actual usage is {((actualCost / predictedCost - 1) * 100).toFixed(0)}% higher than physics model prediction. Leaks suspected.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
