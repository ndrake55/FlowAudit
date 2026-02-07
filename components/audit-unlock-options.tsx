"use client"

import { Button } from "@/components/ui/button"
import { createOneTimeAuditCheckout, createSubscriptionCheckout } from "@/app/actions/stripe"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

export function AuditUnlockOptions({ auditReportId }: { auditReportId: string }) {
    const [isPendingOneTime, startOneTime] = useTransition()
    const [isPendingSub, startSub] = useTransition()

    return (
        <div className="space-y-4 w-full">
            <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
                onClick={() => startOneTime(() => createOneTimeAuditCheckout(auditReportId))}
                disabled={isPendingOneTime || isPendingSub}
            >
                {isPendingOneTime ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Unlock This Report ($499)
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or save with subscription</span>
                </div>
            </div>

            <Button
                size="lg"
                variant="outline"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 shadow-sm"
                onClick={() => startSub(() => createSubscriptionCheckout(auditReportId))}
                disabled={isPendingOneTime || isPendingSub}
            >
                {isPendingSub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Subscribe & Unlock ($199/mo)
            </Button>
            <p className="text-xs text-slate-400 text-center">
                Secure payment via Stripe. Cancel anytime.
            </p>
        </div>
    )
}
