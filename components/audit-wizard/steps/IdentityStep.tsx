"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlacesAutocomplete } from "../PlacesAutocomplete";

interface IdentityStepProps {
    initialData: {
        dealName: string;
        address: any;
    };
    onSave: (data: any) => void;
    onNext: () => void;
}

export function IdentityStep({ initialData, onSave, onNext }: IdentityStepProps) {
    const { dealName, address } = initialData;

    const handleDealNameChange = (val: string) => {
        onSave({ dealName: val });
    };

    const handleAddressSelect = (val: any) => {
        onSave({ address: val });
    };

    const isComplete = dealName.length > 2 && !!address;

    return (
        <Card className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Target Asset</h2>
                <p className="text-sm text-slate-500">
                    Identify the property you want to audit.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="dealName">Deal Reference</Label>
                    <Input
                        id="dealName"
                        placeholder="e.g. Project Alpha or SpeedWash on Main"
                        value={dealName}
                        onChange={(e) => handleDealNameChange(e.target.value)}
                    />
                    <p className="text-xs text-slate-400">
                        For your internal tracking (CRM).
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Property Address</Label>
                    <PlacesAutocomplete
                        onSelect={handleAddressSelect}
                        selectedAddress={address?.description}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={onNext}
                    disabled={!isComplete}
                    size="lg"
                >
                    Continue to Operational Data
                </Button>
            </div>
        </Card>
    );
}
