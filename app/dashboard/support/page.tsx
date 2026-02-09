"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { submitSupportTicket } from "@/app/actions/support"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const ticketSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
})

type TicketFormValues = z.infer<typeof ticketSchema>

export default function SupportPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema),
    })

    const onSubmit = async (data: TicketFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await submitSupportTicket(data)
            if (result.success) {
                toast.success("Support ticket submitted successfully!")
                reset()
            } else {
                toast.error("Failed to submit ticket. Please try again.")
            }
        } catch (error) {
            toast.error("An error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container max-w-2xl py-10">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
                    <p className="text-muted-foreground">
                        Need help? Submit a ticket and our team will get back to you.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Submit a Request</CardTitle>
                        <CardDescription>
                            We typically respond within 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g. Issue with billing"
                                    {...register("subject")}
                                />
                                {errors.subject && (
                                    <p className="text-sm text-red-500">{errors.subject.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Describe your issue in detail..."
                                    className="min-h-[150px]"
                                    {...register("message")}
                                />
                                {errors.message && (
                                    <p className="text-sm text-red-500">{errors.message.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
