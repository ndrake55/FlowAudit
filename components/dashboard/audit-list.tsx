"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { deleteAudit } from "@/app/actions/audit";
import { SwipeableListItem } from "./swipeable-list-item";
import { AuditListActions } from "@/components/audit-list-actions";

interface DealData {
  id: string;
  name: string;
  createdAt: Date;
  status: string;
  variance: number | null;
  isLeak: boolean;
  reportId?: string;
}

interface AuditListProps {
  deals: DealData[];
}

export function AuditList({ deals: initialDeals }: AuditListProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[16px] bg-card mt-8">
        <p className="text-muted-foreground text-lg mb-4">No audits found.</p>
      </div>
    );
  }

  const handleDelete = (dealId: string) => {
    // Remove optimistically
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    
    startTransition(async () => {
      try {
        await deleteAudit(dealId);
        toast.success("Audit deleted successfully.");
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete audit.");
        // Revert on failure (could improve this, but refresh will sync)
        router.refresh();
      }
    });
  };

  const handleRowClick = (deal: DealData) => {
    const viewReportUrl = deal.reportId
      ? `/dashboard/audit-report/${deal.reportId}`
      : `/dashboard/audit/${deal.id}`;
    router.push(viewReportUrl);
  };

  return (
    <div className="space-y-4 mt-6">
      {deals.map((deal) => (
        <SwipeableListItem
          key={deal.id}
          onDelete={() => handleDelete(deal.id)}
          onClick={() => handleRowClick(deal)}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-lg text-foreground">
                {deal.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Created {format(new Date(deal.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</span>
                <Badge
                  variant={
                    deal.status === "Complete"
                      ? "outline"
                      : deal.status === "Payment Pending"
                      ? "secondary"
                      : "secondary"
                  }
                  className={
                    deal.status === "Payment Pending"
                      ? "bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/30 hover:bg-[var(--warning)]/30"
                      : deal.status === "Complete"
                      ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
                      : ""
                  }
                >
                  {deal.status}
                </Badge>
              </div>

              <div className="flex flex-col items-end gap-1 min-w-[80px]">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Variance</span>
                <span
                  className={`font-mono font-bold text-base ${
                    deal.isLeak ? "text-[var(--destructive)]" : "text-[var(--success)]"
                  }`}
                >
                  {deal.variance !== null ? `${deal.variance.toFixed(1)}%` : "-"}
                </span>
              </div>
              
              <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
                <AuditListActions
                    dealId={deal.id}
                    reportId={deal.reportId}
                    status={deal.status}
                />
              </div>
            </div>
          </div>
        </SwipeableListItem>
      ))}
    </div>
  );
}
