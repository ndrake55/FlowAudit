"use client";

import { Button } from "@/components/ui/button";
import { Link as LinkIcon, MoreVertical, Trash, FileText, Printer } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { deleteAudit } from "@/app/actions/audit";
import { toast } from "sonner";

interface AuditListActionsProps {
    dealId: string;
    reportId?: string;
    status: string;
}

export function AuditListActions({ dealId, reportId, status }: AuditListActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this audit? This action cannot be undone.")) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteAudit(dealId);
                toast.success("Audit deleted successfully.");
            } catch (error) {
                toast.error("Failed to delete audit.");
            }
        });
    };

    // Determine the target URL for the "View Report" button
    const viewReportUrl = reportId
        ? `/dashboard/audit-report/${reportId}` // New Report Page
        : `/dashboard/audit/${dealId}`; // Continue Audit Wizard

    return (
        <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
                <Link href={viewReportUrl}>
                    {reportId ? "View Report" : "Continue"}
                </Link>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={viewReportUrl}>
                            <FileText className="mr-2 h-4 w-4" />
                            {reportId ? "View Report" : "Continue Audit"}
                        </Link>
                    </DropdownMenuItem>
                    {reportId && (
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/audit-report/${reportId}?print=true`}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
