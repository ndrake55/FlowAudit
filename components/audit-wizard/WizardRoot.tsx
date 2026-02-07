"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import { StepIndicator } from "./StepIndicator";
import { IdentityStep } from "./steps/IdentityStep";
import { ForensicStep } from "./steps/ForensicStep";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WizardState {
    dealName: string;
    address: {
        description: string;
        placeId: string;
        lat: number;
        lng: number;
    } | null;
}

function WizardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Lifted State
    const [auditData, setAuditData] = useState<WizardState>({
        dealName: "",
        address: null
    });

    const step = searchParams.get("step") || "identity";

    const steps = [
        { key: "identity", label: "Identity & Location" },
        { key: "forensic", label: "Forensic Analysis" },
        { key: "processing", label: "Processing" },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const handleStepChange = useCallback((newStep: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("step", newStep);
        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    const updateAuditData = (data: Partial<WizardState>) => {
        setAuditData(prev => ({ ...prev, ...data }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    New Audit Inspection
                </h1>
                <p className="text-slate-500">
                    Configure a new forensic audit for your property.
                </p>
            </div>

            <StepIndicator
                steps={steps}
                currentStep={step}
                progress={progress}
            />

            <div className="mt-8">
                {step === "identity" && (
                    <IdentityStep
                        initialData={auditData}
                        onSave={updateAuditData}
                        onNext={() => handleStepChange("forensic")}
                    />
                )}

                {step === "forensic" && (
                    <ForensicStep
                        dealName={auditData.dealName}
                        address={auditData.address}
                        onBack={() => handleStepChange("identity")}
                        onNext={() => handleStepChange("processing")}
                    />
                )}
            </div>
        </div>
    );
}

export function WizardRoot() {
    return (
        <Suspense fallback={<div>Loading wizard...</div>}>
            <WizardContent />
        </Suspense>
    );
}
