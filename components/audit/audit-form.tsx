'use client';

import { useState, useTransition } from "react";
import { performAuditAction, processUploadedBill } from "@/app/actions/audit";
import { FileUploader } from "@/components/audit/file-uploader";
import { PaywallCard } from "@/components/audit/paywall-card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Machine, MachineDefinition, Location } from "@prisma/client";

interface AuditFormProps {
    locationId: string;
    machines: (Omit<Machine, "vendPrice"> & {
        vendPrice: number;
        machineDefinition: MachineDefinition;
        location: Omit<Location, "askingPrice" | "claimedMonthlyRevenue"> & {
            askingPrice: number | null;
            claimedMonthlyRevenue: number | null;
        }
    })[];
    initialResult?: any;
}

export function AuditForm({ locationId, machines, initialResult }: AuditFormProps) {
    const [billTotal, setBillTotal] = useState<string>("");
    const [cycleData, setCycleData] = useState<Record<string, number>>({});
    const [result, setResult] = useState<any | null>(initialResult || null);
    const [pending, startTransition] = useTransition();

    const handleCycleChange = (machineId: string, val: string) => {
        setCycleData((prev) => ({
            ...prev,
            [machineId]: parseInt(val) || 0,
        }));
    };

    const handleSubmit = () => {
        const totalWater = parseFloat(billTotal);
        if (isNaN(totalWater)) {
            toast.error("Please enter a valid bill total.");
            return;
        }

        startTransition(async () => {
            const res = await performAuditAction(locationId, totalWater, cycleData);
            setResult(res);
        });
    };

    const handleUploadComplete = async (s3Keys: string[]) => {
        try {
            toast.info(`Processing ${s3Keys.length} bill(s) with AI...`);

            let totalUsage = 0;
            let processCount = 0;

            for (const key of s3Keys) {
                const data = await processUploadedBill(key);
                // Convert to gallons if needed
                let usageInGallons = data.totalWaterUsage || 0;
                if ((data.usageUnit === 'CCF' || data.usageUnit === 'HCF') && data.totalWaterUsage) {
                    usageInGallons = data.totalWaterUsage * 748;
                }
                totalUsage += usageInGallons;
                processCount++;
            }

            setBillTotal(totalUsage.toString());
            toast.success("Bills processed successfully!", {
                description: `Extracted total usage: ${totalUsage.toLocaleString()} gal from ${processCount} bills.`
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to process one or more bills. Please check manual entry.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Bill Data</CardTitle>
                        <CardDescription>Upload a utility bill or enter data manually.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FileUploader onUploadComplete={handleUploadComplete} />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bill-total">Total Water Usage (Gallons)</Label>
                            <Input
                                id="bill-total"
                                type="number"
                                placeholder="e.g. 15000"
                                value={billTotal}
                                onChange={(e) => setBillTotal(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Machine Cycles</CardTitle>
                        <CardDescription>Enter the number of cycles for each machine.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Water/Cycle (Gal)</TableHead>
                                    <TableHead>Total Monthly Cycles for this Machine Group</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {machines.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            <div className="font-medium">{m.machineDefinition.brand}</div>
                                            <div className="text-xs text-muted-foreground">{m.machineDefinition.modelNumber}</div>
                                        </TableCell>
                                        <TableCell>{m.machineDefinition.waterPerCycleGal}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                placeholder="0"
                                                value={cycleData[m.id] || ""}
                                                onChange={(e) => handleCycleChange(m.id, e.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSubmit} disabled={pending}>
                            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Run Audit"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {result && (
                <div className="relative">
                    {result.isLocked && <PaywallCard auditId={result.billId} />}
                    <Card className={`${result.isLocked ? "filter blur-sm select-none pointer-events-none" : ""} ${result.leakSuspected ? "border-red-500 bg-red-50/50" : "border-green-500 bg-green-50/50"}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Audit Results
                                {result.isLocked ? (
                                    <span className="text-gray-600 bg-gray-100 text-sm px-2 py-1 rounded-full border border-gray-200">Locked</span>
                                ) : (
                                    result.leakSuspected ?
                                        <span className="text-red-600 bg-red-100 text-sm px-2 py-1 rounded-full border border-red-200">Leak Suspected</span> :
                                        <span className="text-green-600 bg-green-100 text-sm px-2 py-1 rounded-full border border-green-200">Pass</span>
                                )}
                            </CardTitle>
                            <CardDescription>Comparison of theoretical vs actual usage.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-background rounded-lg border shadow-sm">
                                    <div className="text-sm text-muted-foreground mb-1">Theoretical Usage</div>
                                    <div className="text-2xl font-bold">{result.totalTheoreticalUsage.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">gal</span></div>
                                </div>
                                <div className="p-4 bg-background rounded-lg border shadow-sm">
                                    <div className="text-sm text-muted-foreground mb-1">Actual Usage</div>
                                    {result.totalActualUsage > result.totalTheoreticalUsage ? (
                                        <div className="text-2xl font-bold text-red-600">{result.totalActualUsage.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">gal</span></div>
                                    ) : (
                                        <div className="text-2xl font-bold text-green-600">{result.totalActualUsage.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">gal</span></div>
                                    )}
                                </div>
                                <div className="p-4 bg-background rounded-lg border shadow-sm">
                                    <div className="text-sm text-muted-foreground mb-1">Variance</div>
                                    <div className={`text-2xl font-bold ${result.leakSuspected ? 'text-red-600' : 'text-green-600'}`}>
                                        {result.variance === Infinity ? "Infinity" : (result.variancePercentage || result.variance || 0).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
