"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    key: string;
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: string;
    progress: number;
}

export function StepIndicator({ steps, currentStep, progress }: StepIndicatorProps) {
    const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

    return (
        <div className="relative">
            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-10" />
            <div
                className="absolute top-4 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />

            <div className="flex justify-between w-full">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300",
                                    isCompleted ? "bg-blue-600 border-blue-600 text-white" :
                                        isCurrent ? "border-blue-600 text-blue-600 bg-blue-50" :
                                            "border-slate-200 text-slate-400 bg-white"
                                )}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium transition-colors duration-300",
                                    isCurrent ? "text-blue-600" : "text-slate-500"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
