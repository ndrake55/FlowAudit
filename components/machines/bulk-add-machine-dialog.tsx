'use client';

import { useState, useTransition } from "react";
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
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { bulkAddMachines } from "@/app/actions/machines";
import { MachineDefinition, Location } from "@prisma/client";

interface SerializedLocation extends Omit<Location, 'askingPrice' | 'claimedMonthlyRevenue'> {
    askingPrice: number | null;
    claimedMonthlyRevenue: number | null;
}

interface BulkAddMachineDialogProps {
    definitions: MachineDefinition[];
    locations: SerializedLocation[];
}

export function BulkAddMachineDialog({ definitions, locations }: BulkAddMachineDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [locationId, setLocationId] = useState<string>("");
    const [definitionId, setDefinitionId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("10");
    const [startId, setStartId] = useState<string>("1");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!locationId || !definitionId || !quantity || !startId) {
            toast.error("Please fill in all fields");
            return;
        }

        const qty = parseInt(quantity);
        const start = parseInt(startId);

        if (isNaN(qty) || qty <= 0) {
            toast.error("Quantity must be a positive number");
            return;
        }

        startTransition(async () => {
            try {
                await bulkAddMachines(locationId, definitionId, qty, start);
                toast.success(`Successfully added ${qty} machines`);
                setOpen(false);
                // Reset form slightly but keep location/definition for convenience? 
                // Let's reset IDs to avoid accidental dupes
                setStartId((start + qty).toString());
            } catch (error) {
                console.error(error);
                toast.error("Failed to bulk add machines");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Bulk Add
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Bulk Add Machines</DialogTitle>
                        <DialogDescription>
                            Add multiple identical machines at once.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Select value={locationId} onValueChange={setLocationId}>
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
                        <div className="grid gap-2">
                            <Label htmlFor="model">Machine Model</Label>
                            <Select value={definitionId} onValueChange={setDefinitionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {definitions.map((def) => (
                                        <SelectItem key={def.id} value={def.id}>
                                            {def.brand} {def.modelNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="startId">Starting ID #</Label>
                                <Input
                                    id="startId"
                                    type="number"
                                    min="1"
                                    value={startId}
                                    onChange={(e) => setStartId(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Machines
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
