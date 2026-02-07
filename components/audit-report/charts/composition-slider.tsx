"use client"

import { cn } from "@/lib/utils"

interface CompositionSliderProps {
    value: number // 0 to 1 (percentage of primary metric)
    labelLeft: string
    labelRight: string
    className?: string
}

export function CompositionSlider({ value, labelLeft, labelRight, className }: CompositionSliderProps) {
    // Value 0 -> Left (100% Left Label)
    // Value 1 -> Right (100% Right Label)
    // Wait, usually composition is "70% Single Family".
    // Does that mean 70% towards Left? Or 70% of the bar is Left?
    // "Alt Season" chart: Left is Bitcoin (75%), Right is Altcoin (25%). Thumb is at 25%.
    // If we want "70% Single Family", we should probably visually show a bar that is 70% filled, or a thumb at 70%?
    // Let's use a "Balance" slider.
    // Left: Single Family. Right: Multi Family.
    // If 100% Single Family -> Slider all the way to Left.
    // If 100% Multi Family -> Slider all the way to Right.
    // So if 70% Single Family, then 30% Multi. Position should be 30% (closer to Left)? 
    // Or Position 0 = 100% Single. Position 100 = 100% Multi.
    // If 0.7 Single, then Position = 0.3 (30%) on the slider (closer to single).

    // Let's assume input `value` is % of Left Label.
    // Position = (1 - value) * 100.

    const percentage = Math.min(Math.max(value, 0), 1)
    const position = (1 - percentage) * 100

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>{labelLeft}</span>
                <span>{labelRight}</span>
            </div>

            <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 overflow-visible">
                {/* Gradient Track - Blue to Purple */}
                <div
                    className="absolute inset-0 rounded-full opacity-80"
                    style={{
                        background: `linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)`
                    }}
                />

                {/* Thumb */}
                <div
                    className="absolute top-1/2 -mt-3 h-6 w-6 rounded-full border-4 border-white shadow-lg z-20 transition-all duration-1000 ease-out flex items-center justify-center transform -translate-x-1/2 ring-1 ring-slate-200"
                    style={{ left: `${position}%`, backgroundColor: '#fff' }}
                >
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>{(percentage * 100).toFixed(0)}%</span>
                <span>{((1 - percentage) * 100).toFixed(0)}%</span>
            </div>
        </div>
    )
}
