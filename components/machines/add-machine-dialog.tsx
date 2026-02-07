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
import { Label } from "@/components/ui/label";
import { createMachine } from "@/app/actions/machines";
import { Loader2, Plus } from "lucide-react";
import { MachineDefinition, Location } from "@prisma/client";
import { toast } from "sonner";

interface SerializedLocation extends Omit<Location, 'askingPrice' | 'claimedMonthlyRevenue'> {
    askingPrice: number | null;
    claimedMonthlyRevenue: number | null;
}

interface AddMachineDialogProps {
    definitions: MachineDefinition[];
    locations: SerializedLocation[];
}

export function AddMachineDialog({ definitions, locations }: AddMachineDialogProps) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");

    const handleSubmit = () => {
        if (!selectedLocation || !selectedModel) {
            toast.error("Please select both a location and a machine model.");
            return;
        }

        startTransition(async () => {
            try {
                await createMachine(selectedLocation, selectedModel);
                toast.success("Machine added successfully");
                setOpen(false);
                setSelectedLocation("");
                setSelectedModel("");
            } catch (error) {
                toast.error("Failed to add machine");
                console.error(error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Machine
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Machine</DialogTitle>
                    <DialogDescription>
                        Add a machine to your fleet.
                    </DialogDescription>
                </DialogHeader>
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
                    <div className="space-y-2">
                        <Label>Machine Model</Label>
                        <Select onValueChange={setSelectedModel} value={selectedModel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                {definitions.map((def) => (
                                    <SelectItem key={def.id} value={def.id}>
                                        {def.brand} - {def.modelNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={pending}>
                        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Machine"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
