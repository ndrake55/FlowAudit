"use client"

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts"

export interface ChartDataPoint {
    value: number
}

interface SparklineChartProps {
    data: ChartDataPoint[]
    color?: string
}

export function SparklineChart({ data, color }: SparklineChartProps) {
    if (!data || data.length < 2) return null

    // Fallback color if not provided
    const strokeColor = color || (data[data.length - 1].value >= data[0].value ? "#16a34a" : "#dc2626")

    // Determine min/max for domain padding logic if needed, or just let recharts handle it
    const values = data.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1 || min * 0.05 // Handle flat line case (padding based on value)

    return (
        <div className="h-[40px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis
                        domain={[min - padding, max + padding]}
                        hide
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={strokeColor}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
