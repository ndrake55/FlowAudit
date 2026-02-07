"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { completeOnboarding } from "@/app/actions/user"
import { toast } from "sonner"

export function OnboardingWizard() {
    const [open, setOpen] = useState(false)

    // Use useEffect to check local storage or server state
    // ideally this checks a prop passed from server, but for now we simulate client-side check
    useEffect(() => {
        // Check if user has seen onboarding
        // In real app, this would be passed as a prop from the server component wrapper
        const hasSeen = localStorage.getItem("flowaudit_onboarding_seen")
        if (!hasSeen) {
            setOpen(true)
        }
    }, [])

    const handleClose = async () => {
        setOpen(false)
        // localStorage.setItem("flowaudit_onboarding_seen", "true") // Removed client-side storage
        // Should also trigger server action to update DB
        try {
            await completeOnboarding()
            toast.success("Onboarding complete! Welcome to FlowAudit.")
            // console.log("Onboarding complete")
        } catch (error) {
            console.error("Failed to complete onboarding:", error)
            toast.error("Failed to save onboarding status. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome to FlowAudit</DialogTitle>
                    <DialogDescription>
                        Let's get you set up to start auditing your utility bills.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>This is a placeholder for the onboarding steps.</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        <li>Configure your machines</li>
                        <li>Upload your first utility bill</li>
                        <li>View your audit report</li>
                    </ol>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleClose}>Get Started</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
