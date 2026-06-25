import { getDeals } from "@/app/actions/audit";
import { syncStripeStatus } from "@/app/actions/stripe";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AuditList } from "@/components/dashboard/audit-list";

interface DashboardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
    const searchParams = await props.searchParams;
    const { session_id, success } = searchParams;

    // Server-Side Payment Verification (Backup for Webhooks)
    if (success && typeof session_id === 'string') {
        await syncStripeStatus(session_id);
    }

    const deals = await getDeals();

    const mappedDeals = deals.map(deal => {
        const latestBill = deal.utilityBills[0];
        const latestReport = latestBill?.auditReport;

        const status = latestReport
            ? (latestReport.paymentStatus === "PAID" ? "Complete" : "Payment Pending")
            : ((deal.utilityBills.length > 0 && deal.machines.length > 0) ? "In Progress" :
                (deal.machines.length > 0 ? "Setup" : "Draft"));

        const variance = latestReport ? latestReport.variancePercentage : null;
        const isLeak = latestReport ? latestReport.leakSuspected : false;

        return {
            id: deal.id,
            name: deal.name,
            createdAt: deal.createdAt,
            status,
            variance,
            isLeak,
            reportId: latestReport?.id
        };
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">My Audits</h1>
                    <p className="text-muted-foreground text-base">Manage your due diligence audits and deals.</p>
                </div>
                {/* Unified New Audit Flow */}
                <Link href="/dashboard/new-audit" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto shadow-[var(--shadow-medium)] rounded-full">
                        <Plus className="mr-2 size-5" />
                        Start New Due Diligence
                    </Button>
                </Link>
            </div>

            <div className="w-full">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Active Deals</h2>
                <AuditList deals={mappedDeals} />
            </div>
        </div>
    );
}
