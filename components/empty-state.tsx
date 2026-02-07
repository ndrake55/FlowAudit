import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: LucideIcon;
}

export function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon: Icon,
}: EmptyStateProps) {
    return (
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed bg-gray-50/50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                {Icon && (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-4">
                        <Icon className="h-10 w-10 text-blue-600" />
                    </div>
                )}
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mb-4 mt-2 text-sm text-gray-500">
                    {description}
                </p>

                {actionLabel && (
                    <Button onClick={onAction} variant="default" size="sm" className="relative">
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
