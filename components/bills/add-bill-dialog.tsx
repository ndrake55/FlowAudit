'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUtilityBill } from "@/app/actions/bills";
import { processUploadedBill } from "@/app/actions/audit";
import { Loader2, Plus, UploadCloud } from "lucide-react";
import { Location } from "@prisma/client";
import { toast } from "sonner";
import { FileUploader } from "@/components/audit/file-uploader";

interface AddBillDialogProps {
    locations: Location[];
}

export function AddBillDialog({ locations }: AddBillDialogProps) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [step, setStep] = useState<'upload' | 'review'>('upload');

    // Form Data
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [s3Key, setS3Key] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [totalWater, setTotalWater] = useState<string>("");
    const [totalCost, setTotalCost] = useState<string>("");

    const handleUploadComplete = async (key: string) => {
        setS3Key(key);
        toast.info("Processing bill with AI...");
        try {
            const result = await processUploadedBill(key);
            console.log("AI Result:", result);

            if (result) {
                // Parse "YYYY-MM-DD to YYYY-MM-DD"
                if (result.billing_period) {
                    const parts = result.billing_period.split(' to ');
                    if (parts.length === 2) {
                        setStartDate(parts[0].trim());
                        setEndDate(parts[1].trim());
                    }
                }

                if (result.calculated_gallons !== undefined) {
                    setTotalWater(String(result.calculated_gallons));
                }

                if (result.total_bill_amount !== undefined) {
                    setTotalCost(String(result.total_bill_amount));
                }

                if (result.warning_flag) {
                    toast.warning(`Note: ${result.warning_flag}`);
                }

                toast.success("Bill processed! Please review details.");
                setStep('review');
            } else {
                toast.warning("Could not extract data automatically. Please enter details.");
                setStep('review');
            }
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Failed to process bill. Please enter details manually.");
            setStep('review');
        }
    };

    const handleSave = () => {
        if (!selectedLocation || !startDate || !endDate || !totalWater || !totalCost) {
            toast.error("Please fill in all fields.");
            return;
        }

        startTransition(async () => {
            try {
                await createUtilityBill({
                    locationId: selectedLocation,
                    s3Key,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    totalWaterGal: Number(totalWater),
                    totalCost: Number(totalCost)
                });
                toast.success("Bill saved successfully");
                setOpen(false);
                // Reset state
                setStep('upload');
                setSelectedLocation("");
                setS3Key("");
                setStartDate("");
                setEndDate("");
                setTotalWater("");
                setTotalCost("");
            } catch (error) {
                toast.error("Failed to save bill");
                console.error(error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bill
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Utility Bill</DialogTitle>
                    <DialogDescription>
                        Upload a utility bill PDF to extract data and save it.
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' ? (
                    <div className="py-4">
                        <div className="bg-muted/50 border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center">
                            <FileUploader onUploadComplete={(keys) => {
                                if (keys.length > 0) handleUploadComplete(keys[0]);
                            }} maxFiles={1} />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Select onValueChange={setSelectedLocation} value={selectedLocation}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Water (Gal)</Label>
                                <Input type="number" value={totalWater} onChange={(e) => setTotalWater(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Cost ($)</Label>
                                <Input type="number" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 'review' && (
                        <div className="flex w-full justify-between">
                            <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>
                            <Button onClick={handleSave} disabled={pending}>
                                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Bill"}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
