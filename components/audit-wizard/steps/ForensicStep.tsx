"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiFileDropzone } from "@/components/ui/multi-file-dropzone";
import { uploadAuditFiles } from "@/app/actions/upload";
import { createForensicAudit } from "@/app/actions/wizard";
import { getWaterRatesAction } from "@/app/actions/intelligence";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle, BrainCircuit, AlertTriangle, XCircle } from "lucide-react";

interface ForensicStepProps {
    dealName: string;
    address: {
        description: string;
        placeId: string;
        lat: number;
        lng: number;
    } | null;
    onNext: () => void;
    onBack: () => void;
}

// Machine Options including Dryers
// In a real app, type would be from DB. We treat waterPerCycle = 0 for Dryers.
const MACHINE_OPTIONS = [
    { id: "speed-queen-horizon", label: "Speed Queen Horizon (Washer)", type: "WASHER", waterPerCycle: 18, defaultVend: 5.00 },
    { id: "top-load-generic", label: "Top Load Generic (Washer)", type: "WASHER", waterPerCycle: 25, defaultVend: 4.50 },
    { id: "large-washer-60lb", label: "Large Washer 60lb", type: "WASHER", waterPerCycle: 45, defaultVend: 9.00 },
    { id: "large-washer-80lb", label: "Large Washer 80lb", type: "WASHER", waterPerCycle: 55, defaultVend: 11.00 },
] as const;

export function ForensicStep({ dealName, address, onNext, onBack }: ForensicStepProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
    const [aiVerified, setAiVerified] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ title: string; message: string } | null>(null);
    const router = useRouter();

    // Financial Data
    const [askingPrice, setAskingPrice] = useState<string>("");
    const [statedRevenue, setStatedRevenue] = useState<string>("");

    // P&L / Water Rate Logic
    const [isPnL, setIsPnL] = useState(false);
    const [waterCost, setWaterCost] = useState<string>("");
    const [waterRate, setWaterRate] = useState<string>(""); // $/unit (748 gal usually)
    const [sewerRate, setSewerRate] = useState<string>(""); // Added: Sewer Rate

    // Operational Data
    const [billVolume, setBillVolume] = useState<string>("");

    // Effect to Reverse Engineer Volume from Cost
    const calculateVolumeFromCost = () => {
        const cost = parseFloat(waterCost);
        const wRate = parseFloat(waterRate);
        const sRate = parseFloat(sewerRate) || 0; // Optional sewer rate

        if (cost > 0 && (wRate + sRate) > 0) {
            const totalRate = wRate + sRate;
            const hcf = cost / totalRate;
            const gals = Math.round(hcf * 748);
            setBillVolume(gals.toString());
            setAiVerified(true); // Derived verified
        }
    };

    // Auto-Calculate when inputs change
    useEffect(() => {
        if (isPnL && waterCost && (waterRate || sewerRate)) {
            calculateVolumeFromCost();
        }
    }, [waterCost, waterRate, sewerRate, isPnL]);


    // Machine Mix
    const [machines, setMachines] = useState<{ id: string; modelId: string; count: number; vendPrice: number }[]>([
        { id: "1", modelId: "speed-queen-horizon", count: 10, vendPrice: 5.00 }
    ]);

    const addMachineRow = () => {
        setMachines([...machines, { id: Math.random().toString(), modelId: "top-load-generic", count: 1, vendPrice: 4.50 }]);
    };

    const removeMachineRow = (id: string) => {
        if (machines.length > 1) {
            setMachines(machines.filter(m => m.id !== id));
        }
    };

    const updateMachine = (id: string, field: "modelId" | "count" | "vendPrice", value: any) => {
        setMachines(machines.map(m => {
            if (m.id !== id) return m;

            if (field === "modelId") {
                // If model changes, update default vend price
                const option = MACHINE_OPTIONS.find(o => o.id === value);
                return { ...m, modelId: value, vendPrice: option?.defaultVend || m.vendPrice };
            }

            return { ...m, [field]: value };
        }));
    };

    const handleManualUpload = async (filesToUpload: File[]) => {
        setIsUploading(true);
        setAlertMessage(null); // Clear previous alerts
        const formData = new FormData();
        filesToUpload.forEach((file) => formData.append("files", file));

        try {
            const results = await uploadAuditFiles(formData);

            // Check for Warnings first via simple filter
            const rejectedFiles = results.filter(r => r.analysis?.warning_flag);
            const validFiles = results.filter(r => !r.analysis?.warning_flag);

            if (rejectedFiles.length > 0) {
                // Warning Logic
                const warning = rejectedFiles[0].analysis?.warning_flag;
                setAlertMessage({
                    title: "Action Required: Re-Upload Utility Bill",
                    message: warning || "Action Required: Please Upload water bills and try again. This Profit and Loss statement combines the Utility bills and can not be used to create the report."
                });
                toast.error("File rejected: Combined Utilities detected.");

                // Remove rejected file from UI (MultiFileDropzone usually handles its own state, 
                // but we reset 'files' to force user to try again or remove the bad one manually.
                // Since this component is controlled, we can just clear 'files' for now or handle more gracefully.)
                setFiles([]);
                setUploadedKeys(validFiles.map(r => r.key)); // Only keep valid
            } else {
                const keys = validFiles.map(r => r.key);
                setUploadedKeys(keys);
            }

            // Process Valid Analysis
            const analyses = validFiles.map(r => r.analysis).filter(a => a !== null && a !== undefined);

            if (analyses.length > 0) {
                // Check if any is P&L
                const pnlDoc = analyses.find(a => a.document_type === "PNL");

                if (pnlDoc) {
                    setIsPnL(true);
                    if (pnlDoc.water_cost_amount) {
                        setWaterCost(pnlDoc.water_cost_amount.toString());
                        toast.success(`AI Detected P&L: Water Cost $${pnlDoc.water_cost_amount}`);

                        if (pnlDoc.washer_income_amount) {
                            setStatedRevenue(pnlDoc.washer_income_amount.toString());
                            toast.success(`AI Detected Washer Revenue: $${pnlDoc.washer_income_amount}`);
                        }

                        // AUTO-FETCH RATES (Preserved from original)
                        if (address) {
                            const parts = address.description.split(",");
                            const city = parts[parts.length - 3]?.trim();
                            const zipMatch = address.description.match(/\b\d{5}\b/);
                            const zip = zipMatch ? zipMatch[0] : "";
                            const state = "CA";

                            if (city && zip) {
                                toast.info(`Fetching Rates for ${city}...`);
                                const rateInfo = await getWaterRatesAction(city, state, zip);
                                if (rateInfo) {
                                    setWaterRate(rateInfo.ratePerUnit.toFixed(2));
                                    if (rateInfo.sewerRatePerUnit) {
                                        setSewerRate(rateInfo.sewerRatePerUnit.toFixed(2));
                                        toast.success(`Found Rates: Water $${rateInfo.ratePerUnit} + Sewer $${rateInfo.sewerRatePerUnit}`);
                                    } else {
                                        toast.success(`Found Water Rate: $${rateInfo.ratePerUnit.toFixed(2)} / ${rateInfo.unitType}`);
                                    }
                                } else {
                                    toast.warning("Could not auto-detect rates. Please enter manually.");
                                }
                            }
                        }
                    } else {
                        toast.info("P&L Detected. Please enter Water Cost line item.");
                    }
                } else {
                    // Standard Bills - Calculate Average
                    setIsPnL(false);

                    const validVolumes = analyses
                        .filter(a => a.calculated_gallons && a.calculated_gallons > 0 && a.document_type !== "PNL")
                        .map(a => a.calculated_gallons!);

                    if (validVolumes.length > 0) {
                        const totalVol = validVolumes.reduce((acc, val) => acc + val, 0);
                        const averageVol = Math.round(totalVol / validVolumes.length);

                        setBillVolume(averageVol.toString());
                        setAiVerified(true);

                        if (validVolumes.length > 1) {
                            toast.success(`Gemini AI: Averaged ${validVolumes.length} bills. Avg: ${averageVol.toLocaleString()} Gallons/mo`);
                        } else {
                            toast.success(`Gemini AI: Extracted ${averageVol.toLocaleString()} Gallons`);
                        }
                    } else {
                        toast.warning("Bills uploaded but no usage volume found. Please enter manually.");
                    }
                }
            } else if (validFiles.length > 0) {
                toast.success("Files uploaded. Please verify data manually.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyze = async () => {
        setIsUploading(true);
        let keys: string[] = [];

        // 1. Mandatory File Upload Check
        if (files.length === 0 && uploadedKeys.length === 0) {
            toast.error("Please upload a utility bill or P&L.");
            setIsUploading(false);
            return;
        }

        // Upload Files if present
        if (files.length > 0 && uploadedKeys.length === 0) {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));
            try {
                // Re-use logic? Ideally yes, but for now simple update
                const results = await uploadAuditFiles(formData);
                keys = results.map(r => r.key);
                setUploadedKeys(keys);
            } catch (error) {
                console.error(error);
                toast.error("File upload failed.");
                setIsUploading(false);
                return;
            }
        } else {
            keys = uploadedKeys;
        }

        // 2. Validate Manual Data
        const volume = parseFloat(billVolume);
        const asking = parseFloat(askingPrice);

        if (isNaN(volume) || volume <= 0) {
            toast.error("Total Bill Volume is required. Check Water Cost/Rate inputs.");
            setIsUploading(false);
            return;
        }
        if (isNaN(asking) || asking <= 0) {
            toast.error("Please enter the Asking Price.");
            setIsUploading(false);
            return;
        }

        // 3. Submit
        try {
            const machineData = machines.map(m => {
                const def = MACHINE_OPTIONS.find(o => o.id === m.modelId);
                return {
                    modelId: m.modelId,
                    type: def?.type || "WASHER",
                    count: m.count,
                    vendPrice: m.vendPrice
                };
            });

            const auditId = await createForensicAudit({
                dealName: dealName || ("Forensic Audit - " + new Date().toLocaleDateString()),
                address: address?.description || "Unknown Address",
                placeId: address?.placeId || "unknown",
                fileKeys: keys,
                manualData: {
                    totalWaterBill: volume,
                    askingPrice: asking,
                    askingRevenue: parseFloat(statedRevenue) || 0,
                    machineMix: machineData
                }
            });

            router.push(`/dashboard/audit-report/${auditId}`);

        } catch (error) {
            console.error(error);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Forensic Data Collection</h2>
                <p className="text-sm text-slate-500">
                    Upload bill or P&L to reverse-engineer revenue reliability.
                </p>
                {address && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Property: {address.description}
                    </div>
                )}
            </div>

            {/* Alert Banner */}
            {alertMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex gap-3 text-red-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{alertMessage.title}</h4>
                        <p className="text-sm opacity-90">{alertMessage.message}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => setAlertMessage(null)}
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Section A: The Artifact (File Upload) */}
            <div className="space-y-4 border-b pb-6">
                <Label>1. Upload Documents (Bill or P&L)</Label>
                <MultiFileDropzone
                    value={files}
                    onChange={setFiles}
                    onUpload={handleManualUpload}
                    isUploading={isUploading}
                />
            </div>

            {/* Section B: Financials */}
            <div className="space-y-4 border-b pb-6">
                <Label className="text-base">2. Deal Financials</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="askingPrice">Asking Price ($) *</Label>
                        <Input
                            id="askingPrice"
                            type="number"
                            placeholder="e.g. 250000"
                            value={askingPrice}
                            onChange={(e) => setAskingPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="revenue">Stated Monthly Revenue (Washers Only)</Label>
                        <Input
                            id="revenue"
                            type="number"
                            placeholder="e.g. 15000"
                            value={statedRevenue}
                            onChange={(e) => setStatedRevenue(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Section C: Operational Data */}
            <div className="space-y-6">
                <div>
                    <Label className="text-base">3. Operational Verification</Label>
                    <p className="text-sm text-slate-500 mb-4">
                        Confirm water usage to solve for True Volume.
                    </p>

                    {/* Switch: P&L vs Direct Bill */}
                    {isPnL && (
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="space-y-2">
                                <Label className="text-amber-800">Water Cost ($)</Label>
                                <Input
                                    value={waterCost}
                                    onChange={(e) => setWaterCost(e.target.value)}
                                    placeholder="Total Water Expense"
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-amber-800">Water Rate ($/HCF)</Label>
                                <Input
                                    value={waterRate}
                                    onChange={(e) => setWaterRate(e.target.value)}
                                    placeholder="e.g. 10.43"
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-amber-800">Sewer Rate ($/HCF)</Label>
                                <Input
                                    value={sewerRate}
                                    onChange={(e) => setSewerRate(e.target.value)}
                                    placeholder="e.g. 10.43"
                                    className="bg-white"
                                />
                                <p className="text-[10px] text-amber-700">
                                    *Combined rates used to solve volume.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="volume">
                            {isPnL ? "Calculated Water Volume (Gallons)" : "Total Water Volume (Gallons) *"}
                        </Label>

                        {/* Volume Display/Input */}
                        {(aiVerified || isPnL) && billVolume ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-200 rounded-md">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700 tracking-wider">
                                            {isPnL ? "REVERSE ENGINEERED" : "AI VERIFIED"}
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {parseFloat(billVolume).toLocaleString()} <span className="text-sm font-normal text-slate-500">gal</span>
                                    </div>
                                </div>
                                {!isPnL && (
                                    <Button variant="ghost" size="sm" onClick={() => setAiVerified(false)} className="text-slate-400">
                                        Edit
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    id="volume"
                                    type="number"
                                    placeholder="Total usage from bill"
                                    value={billVolume}
                                    onChange={(e) => setBillVolume(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Equipment Mix (Washers Only)</Label>
                    {machines.map((machine, index) => (
                        <div key={machine.id} className="flex gap-2 items-end p-3 bg-slate-50 rounded-md border">
                            <div className="flex-[2] space-y-1">
                                <Label className="text-xs">Model</Label>
                                <Select
                                    value={machine.modelId}
                                    onValueChange={(val) => updateMachine(machine.id, "modelId", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MACHINE_OPTIONS.map(opt => (
                                            <SelectItem key={opt.id} value={opt.id}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-20 space-y-1">
                                <Label className="text-xs">Count</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={machine.count}
                                    onChange={(e) => updateMachine(machine.id, "count", parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="w-24 space-y-1">
                                <Label className="text-xs">Vend ($)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.25}
                                    value={machine.vendPrice}
                                    onChange={(e) => updateMachine(machine.id, "vendPrice", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMachineRow(machine.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={machines.length === 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addMachineRow} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Machine Group
                    </Button>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isUploading}>
                    Back
                </Button>
                <Button
                    onClick={handleAnalyze}
                    size="lg"
                    className="w-full ml-4"
                    disabled={isUploading}
                >
                    {isUploading ? "Analyzing..." : "Complete Audit"}
                </Button>
            </div>
        </Card>
    );
}
