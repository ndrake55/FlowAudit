"use client"

import { useEffect, useState } from "react"

interface ConfidenceGaugeProps {
    value: number // 0-100
    label?: string
}

export function ConfidenceGauge({ value, label = "Confidence Score" }: ConfidenceGaugeProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Ensure value is between 0 and 100
    const score = Math.min(Math.max(value, 0), 100)

    // We want the gauge to go from 180 (left) to 360 (right)
    // 0 -> 180
    // 100 -> 360
    // Rotation = 180 + (score / 100) * 180
    const rotation = 180 + (score / 100) * 180

    // Arc segments (simple path d generation)
    // Center 100, 100. Radius 80. Inner Radius 60.
    // We can use a simple stroke-dasharray approach or just multiple paths.
    // Let's use simple heavy strokes for segments.
    // Circle circumference = 2 * pi * r.
    // Half circle = pi * r.
    // If r=80, C ~ 502. Half ~ 251.
    // We have 4 segments. Each is 25% of the range.

    // For simplicity, let's use a single path with a gradient?
    // No, segments are distinct colors in the example.

    // Helper to polar to cartesian
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const rad = angleInDegrees * Math.PI / 180.0;
        return {
            x: Number((centerX + (radius * Math.cos(rad))).toFixed(4)),
            y: Number((centerY + (radius * Math.sin(rad))).toFixed(4))
        };
    }

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, startAngle);
        const end = polarToCartesian(x, y, radius, endAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
        ].join(" ");
        return d;
    }

    // Segments: 
    // 180 -> 225 (Red)
    // 225 -> 270 (Orange)
    // 270 -> 315 (Yellow)
    // 315 -> 360 (Green)

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-[200px] h-[110px]">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                    {/* Definitions for gradients if needed */}
                    <defs>
                        <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                    </defs>

                    {/* Background Tracks - We use stroke width of 20 (Outer 90, Inner 70 -> Center 80) */}

                    {/* Red Segment (Low) - 180 to 225 -> Narrowed for gaps 185 to 220 */}
                    <path d={describeArc(100, 100, 80, 185, 220)} fill="none" stroke="#ef4444" strokeWidth="20" strokeLinecap="round" />

                    {/* Orange Segment (Medium) - 225 to 270 -> Narrowed 230 to 265 */}
                    <path d={describeArc(100, 100, 80, 230, 265)} fill="none" stroke="#f97316" strokeWidth="20" strokeLinecap="round" />

                    {/* Yellow Segment (High) - 270 to 315 -> Narrowed 275 to 310 */}
                    <path d={describeArc(100, 100, 80, 275, 310)} fill="none" stroke="#eab308" strokeWidth="20" strokeLinecap="round" />

                    {/* Green Segment (Very High) - 315 to 360 -> Narrowed 320 to 355 */}
                    <path d={describeArc(100, 100, 80, 320, 355)} fill="none" stroke="#22c55e" strokeWidth="20" strokeLinecap="round" />

                    {/* Indicator Dot */}
                    {(() => {
                        const dotPos = polarToCartesian(100, 100, 80, rotation);
                        return (
                            <>
                                {/* Shadow/Outline effect */}
                                <circle cx={dotPos.x} cy={dotPos.y} r="10" fill="white" />
                                <circle cx={dotPos.x} cy={dotPos.y} r="8" fill="#0f172a" />
                            </>
                        );
                    })()}

                </svg>

                {/* Value Text Overlay - Positioned bottom center */}
                <div className="absolute bottom-0 w-full text-center mb-2">
                    <span className="text-3xl font-bold text-slate-900">{score.toFixed(1)}%</span>
                </div>
            </div>
            <span className="text-xs font-medium text-slate-500 mt-[-10px]">{label}</span>
        </div>
    )
}
