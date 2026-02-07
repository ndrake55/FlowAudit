import { getDeals } from "@/app/actions/audit";
import { getMachineDefinitions } from "@/app/actions/machines";
import { syncStripeStatus } from "@/app/actions/stripe"; // Add this import
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { AuditListActions } from "@/components/audit-list-actions";

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
    const definitions = await getMachineDefinitions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Audits</h1>
                    <p className="text-muted-foreground">Manage your due diligence audits and deals.</p>
                </div>
                {/* Unified New Audit Flow */}
                <Link href="/dashboard/new-audit">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Start New Due Diligence
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Deals</CardTitle>
                    <CardDescription>A list of your current audits and their status.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Date Created</TableHead>
                                <TableHead>Deal Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <span className="text-muted-foreground">No audits found.</span>
                                            <Link href="/dashboard/new-audit">
                                                <Button variant="outline">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Start New Due Diligence
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deals.map((deal) => {
                                    // Determine status and variance from latest report or bill
                                    // Logic: Find latest bill with an audit report
                                    const latestBill = deal.utilityBills[0]; // Ordered by desc in query
                                    const latestReport = latestBill?.auditReport;

                                    const status = latestReport
                                        ? (latestReport.paymentStatus === "PAID" ? "Complete" : "Payment Pending")
                                        : ((deal.utilityBills.length > 0 && deal.machines.length > 0) ? "In Progress" :
                                            (deal.machines.length > 0 ? "Setup" : "Draft"));

                                    const variance = latestReport ? latestReport.variancePercentage : null;
                                    const isLeak = latestReport ? latestReport.leakSuspected : false;

                                    return (
                                        <TableRow key={deal.id} className="h-10">
                                            <TableCell className="font-medium text-muted-foreground text-xs">
                                                {format(deal.createdAt, 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="font-semibold">{deal.name}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        status === "Complete" ? "outline" :
                                                            status === "Payment Pending" ? "secondary" :
                                                                "secondary" // Default
                                                    }
                                                    className={status === "Payment Pending" ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200" : ""}
                                                >
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${isLeak ? 'text-red-600' : 'text-green-600'}`}>
                                                {variance !== null ? `${variance.toFixed(1)}%` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AuditListActions
                                                    dealId={deal.id}
                                                    reportId={latestReport?.id}
                                                    status={status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
