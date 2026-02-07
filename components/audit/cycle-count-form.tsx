"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { submitCycleCounts, runAudit } from "@/app/actions/audit";

// Schema for the form
const cycleCountSchema = z.object({
    counts: z.array(
        z.object({
            machineId: z.string(),
            machineName: z.string().optional(), // For display
            modelNumber: z.string().optional(), // For display
            count: z.coerce.number().min(0, "Must be positive"),
        })
    ),
});

type CycleCountFormValues = z.infer<typeof cycleCountSchema>;

interface CycleCountFormProps {
    utilityBillId: string;
    machines: {
        id: string;
        machineDefinition: {
            brand: string;
            modelNumber: string;
        };
    }[];
    initialCounts: Record<string, number>; // Map machineId -> count
}

export function CycleCountForm({
    utilityBillId,
    machines,
    initialCounts,
}: CycleCountFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Prepare default values
    const defaultValues: CycleCountFormValues = {
        counts: machines.map((m) => ({
            machineId: m.id,
            machineName: m.machineDefinition.brand,
            modelNumber: m.machineDefinition.modelNumber,
            count: initialCounts[m.id] ?? 0,
        })),
    };

    const form = useForm<CycleCountFormValues>({
        resolver: zodResolver(cycleCountSchema) as any,
        defaultValues,
    });

    const { control, register } = form;
    const { fields } = useFieldArray({
        control,
        name: "counts",
    });

    async function onSubmit(data: CycleCountFormValues) {
        setIsSubmitting(true);
        try {
            // 1. Submit Counts
            const payload = data.counts.map((item) => ({
                machineId: item.machineId,
                count: item.count,
            }));

            await submitCycleCounts(utilityBillId, payload);
            toast.success("Cycle counts saved successfully");

            // 2. Trigger Audit (Optional immediately, but good UX to show updated numbers)
            const auditResult = await runAudit(utilityBillId);

            if (auditResult.leakSuspected) {
                toast.error(`Leak Suspected! Variance: ${auditResult.variance.toFixed(1)}%`);
            } else {
                toast.success(`Audit Passed. Variance: ${auditResult.variance.toFixed(1)}%`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to save counts");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Machine Cycle Counts</h3>
                <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save & Run Audit
                        </>
                    )}
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Machine / Model</TableHead>
                            <TableHead>Cycles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{field.machineName}</span>
                                        <span className="text-xs text-muted-foreground">{field.modelNumber}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min={0}
                                        className="max-w-[200px]"
                                        {...register(`counts.${index}.count`)}
                                        onKeyDown={(e) => {
                                            // Optional: enhanced navigation logic could go here
                                            // Default tab behavior works for "spreadsheet style" implicitly
                                        }}
                                    />
                                    {form.formState.errors.counts?.[index]?.count && (
                                        <span className="text-xs text-red-500">
                                            {form.formState.errors.counts[index]?.count?.message}
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
