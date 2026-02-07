"use client"

import { cn } from "@/lib/utils"

interface RevenueSliderProps {
    statedRevenue: number
    realRevenue: number
    className?: string
}

export function RevenueSlider({ statedRevenue, realRevenue, className }: RevenueSliderProps) {
    // Calculate percentage match
    // 100% match means Real == Stated.
    // If Real is 80% of Stated, result is 80.
    // Range we want to show: 50% (Left) to 150% (Right).
    // If value < 50, clamp to 0 position.
    // If value > 150, clamp to 100 position.

    if (!statedRevenue) return null

    const percentage = (realRevenue / statedRevenue) * 100

    // Scale mapping:
    // 50 -> 0% position
    // 100 -> 50% position
    // 150 -> 100% position
    // Formula: Position = (Percentage - 50) 

    // Actually, let's do 0% to 200% to handle extreme discrepancies. 100% is center.
    // 0 -> 0%
    // 100 -> 50%
    // 200 -> 100%
    const position = Math.min(Math.max(percentage / 2, 0), 100)

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Overstated Risk</span>
                <span>Verified Match</span>
                <span>Understated Opportunity</span>
            </div>

            <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 overflow-visible">
                {/* Gradient Track */}
                <div
                    className="absolute inset-0 rounded-full opacity-80"
                    style={{
                        background: `linear-gradient(90deg, 
                            #ef4444 0%, 
                            #fca5a5 25%, 
                            #fef08a 45%, 
                            #22c55e 55%, 
                            #3b82f6 100%)`
                    }}
                />

                {/* Center Marker (100% match) at 50% position */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-900/20 transform -translate-x-1/2 z-10" />

                {/* Thumb */}
                <div
                    className="absolute top-1/2 -mt-3 h-6 w-6 rounded-full border-4 border-white shadow-lg z-20 transition-all duration-1000 ease-out flex items-center justify-center transform -translate-x-1/2 ring-1 ring-slate-200"
                    style={{ left: `${position}%`, backgroundColor: position < 45 ? '#ef4444' : position > 55 ? '#3b82f6' : '#22c55e' }}
                >
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>0% Match</span>
                <span>100% Match</span>
                <span>200%+ Match</span>
            </div>
        </div>
    )
}
