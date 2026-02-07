"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface AuditData {
    month: string;
    actual: number;
    rated: number;
}

interface AuditBarChartProps {
    data: AuditData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as AuditData;
        const actual = data.actual;
        const rated = data.rated;

        // Calculate difference
        const diff = actual - rated;
        const percentDiff = rated > 0 ? (diff / rated) * 100 : 0;
        const isOver = diff > 0;

        return (
            <div className="bg-popover border text-popover-foreground shadow-sm rounded-lg p-3 text-sm">
                <p className="font-semibold mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Actual: {actual.toLocaleString()}
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Rated: {rated.toLocaleString()}
                    </p>
                    <div className={`mt-2 font-medium ${isOver ? "text-red-500" : "text-green-500"}`}>
                        {isOver ? "+" : ""}{percentDiff.toFixed(1)}% {isOver ? "Over Usage" : "Under Usage"}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export function AuditBarChart({ data }: AuditBarChartProps) {
    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)/0.2' }} />
                    <Bar
                        dataKey="rated"
                        fill="#3b82f6" // blue-500
                        radius={[4, 4, 0, 0]}
                        name="Rated Usage"
                    />
                    <Bar
                        dataKey="actual"
                        fill="#ef4444" // red-500
                        radius={[4, 4, 0, 0]}
                        name="Actual Usage"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
