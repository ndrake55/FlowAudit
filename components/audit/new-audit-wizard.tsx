"use client"

import { useState, useTransition } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FileUploader } from "@/components/audit/file-uploader"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { createFullAudit } from "@/app/actions/audit"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// --- Types & Schema ---

const machineRowSchema = z.object({
    machineDefinitionId: z.string().min(1, "Select a model"),
    count: z.coerce.number().min(1, "At least 1"),
    vendPrice: z.coerce.number().min(0, "Price required"),
})

const formSchema = z.object({
    // Step 1: Basics
    name: z.string().min(2, "Deal name required"),
    askingPrice: z.coerce.number().optional(),
    claimedMonthlyRevenue: z.coerce.number().optional(),

    // Step 2: Machines
    machines: z.array(machineRowSchema).min(1, "Add at least one machine type"),

    // Step 3: Evidence (S3 Key)
    s3Key: z.string().optional(), // Optional for now, user might skip
})

type FormValues = z.infer<typeof formSchema>

interface MachineDefinition {
    id: string
    brand: string
    modelNumber: string
}

interface NewAuditWizardProps {
    definitions: MachineDefinition[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

export function NewAuditWizard({ definitions, open, onOpenChange, trigger }: NewAuditWizardProps) {
    const [step, setStep] = useState(1)
    const [pageOpen, setPageOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const isControlled = typeof open !== "undefined"
    const isOpen = isControlled ? open : pageOpen
    const setIsOpen = isControlled ? onOpenChange : setPageOpen

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            askingPrice: 0,
            claimedMonthlyRevenue: 0,
            machines: [{ machineDefinitionId: "", count: 1, vendPrice: 0 }],
            s3Key: "",
        },
    })

    const machineRows = form.watch("machines")

    const handleNext = async () => {
        // Validate current step fields
        let isValid = false
        if (step === 1) {
            isValid = await form.trigger(["name", "askingPrice", "claimedMonthlyRevenue"] as const)
        } else if (step === 2) {
            isValid = await form.trigger("machines")
        } else if (step === 3) {
            isValid = true // Upload is optional or validated inside component (handled by s3Key check if mandatory)
        }

        if (isValid) setStep(s => s + 1)
    }

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        startTransition(async () => {
            try {
                const result = await createFullAudit({
                    name: data.name,
                    askingPrice: data.askingPrice,
                    claimedMonthlyRevenue: data.claimedMonthlyRevenue,
                    machines: data.machines,
                    s3Key: data.s3Key,
                })

                toast.success("Deal created successfully!")
                if (setIsOpen) setIsOpen(false)
                router.push(`/dashboard/audit/${result.locationId}`)
            } catch (error) {
                console.error(error)
                toast.error("Failed to create audit")
            }
        })
    }

    // --- Render Helpers ---

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>New Due Diligence Audit (Step {step}/4)</DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Enter the basics about the laundromat deal."}
                        {step === 2 && "Input the machine mix found at the location."}
                        {step === 3 && "Upload utility bills for verification."}
                        {step === 4 && "Review and start the forensic analysis."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* STEP 1: BASICS */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Deal Name / Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Main St Laundromat" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="askingPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Asking Price ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="500000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="claimedMonthlyRevenue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Claimed Monthly Rev ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="40000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* STEP 2: MACHINES */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {machineRows.map((_, index) => (
                                        <div key={index} className="flex gap-2 items-end border p-3 rounded-md bg-muted/20">
                                            <FormField
                                                control={form.control}
                                                name={`machines.${index}.machineDefinitionId`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Model</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Model" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {definitions.map(def => (
                                                                    <SelectItem key={def.id} value={def.id}>
                                                                        {def.brand} {def.modelNumber}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`machines.${index}.count`}
                                                render={({ field }) => (
                                                    <FormItem className="w-24">
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Count</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min={1} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`machines.${index}.vendPrice`}
                                                render={({ field }) => (
                                                    <FormItem className="w-28">
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Vend Price</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.25" min={0} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    const current = form.getValues("machines")
                                                    if (current.length > 1) {
                                                        const next = current.filter((_, i) => i !== index)
                                                        form.setValue("machines", next)
                                                    }
                                                }}
                                                disabled={machineRows.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        const current = form.getValues("machines")
                                        form.setValue("machines", [...current, { machineDefinitionId: "", count: 1, vendPrice: 0 }])
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Machine Group
                                </Button>
                            </div>
                        )}

                        {/* STEP 3: EVIDENCE */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <FileUploader
                                            maxFiles={1}
                                            onUploadComplete={(keys) => {
                                                if (keys.length > 0) form.setValue("s3Key", keys[0])
                                            }}
                                        />
                                        {/* Show currently uploaded key if existing */}
                                        {form.watch("s3Key") && (
                                            <p className="text-sm text-green-600 mt-2 text-center">
                                                File uploaded successfully. Ready to proceed.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* STEP 4: REVIEW */}
                        {step === 4 && (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-2 border p-4 rounded-lg">
                                    <div className="text-muted-foreground">Deal Name:</div>
                                    <div className="font-medium text-right">{form.getValues("name")}</div>
                                    <div className="text-muted-foreground">Asking Price:</div>
                                    <div className="font-medium text-right">${form.getValues("askingPrice")}</div>
                                    <div className="text-muted-foreground">Claimed Revenue:</div>
                                    <div className="font-medium text-right">${form.getValues("claimedMonthlyRevenue")}/mo</div>
                                </div>
                                <div className="border p-4 rounded-lg">
                                    <div className="font-medium mb-2">Machine Mix</div>
                                    <ul className="space-y-1">
                                        {machineRows.map((row, i) => {
                                            const def = definitions.find(d => d.id === row.machineDefinitionId)
                                            return (
                                                <li key={i} className="flex justify-between">
                                                    <span>{row.count}x {def?.brand} {def?.modelNumber}</span>
                                                    <span>@ ${row.vendPrice}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-6 flex justify-between sm:justify-between w-full">
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} disabled={isPending}>
                                    Back
                                </Button>
                            ) : <div></div>} {/* Spacer */}

                            {step < 4 ? (
                                <Button type="button" onClick={handleNext}>
                                    Next Step
                                </Button>
                            ) : (
                                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Analyze Deal
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
