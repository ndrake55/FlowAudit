"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { createOneTimeAuditCheckout, createSubscriptionCheckout } from "@/app/actions/stripe";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface PaywallCardProps {
    auditId?: string;
}

export function PaywallCard({ auditId }: PaywallCardProps) {
    const [isPendingOneTime, startOneTime] = useTransition();
    const [isPendingSub, startSub] = useTransition();

    const handleOneTimePayment = () => {
        if (!auditId) return;
        startOneTime(async () => {
            await createOneTimeAuditCheckout(auditId);
        });
    };

    const handleSubscription = () => {
        startSub(async () => {
            await createSubscriptionCheckout(auditId);
        });
    }

    return (
        <Card className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md border-2 border-primary shadow-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full w-fit">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Unlock Full Audit Report</CardTitle>
                <CardDescription>
                    Variance analysis and theoretical usage data are locked.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                        <div className="space-y-1">
                            <p className="font-medium leading-none">Single Report</p>
                            <p className="text-sm text-muted-foreground">One-time payment</p>
                        </div>
                        <div className="font-bold text-xl">$499</div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary">
                        <div className="space-y-1">
                            <p className="font-medium leading-none text-primary">Pro Plan</p>
                            <p className="text-sm text-muted-foreground">Unlimited audits</p>
                        </div>
                        <div className="font-bold text-xl text-primary">$199<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubscription}
                    disabled={isPendingSub || isPendingOneTime}
                >
                    {isPendingSub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Subscribe Now
                </Button>
                {/* 
                  TODO: The One-time payment link should probably be dynamic or trigger a server action 
                  to create a session for this specific audit. For now, linking to pricing or generic checkout.
                  The user requirement says "Links to Stripe Payment Link (One-time)".
                  Since we don't have the specific link yet, I'll direct to the subscription page or a placeholder.
                  Wait, Requirement says: "Links to Stripe Payment Link (One-time)".
                  I'll use a placeholder URL for now or a server action button later.
                  Let's assume there is a way to trigger the one-time payment.
                  I will add a second button for One-Time Payment.
                */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleOneTimePayment}
                    disabled={isPendingOneTime || isPendingSub || !auditId}
                >
                    {isPendingOneTime ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay $499 One-Time
                </Button>
            </CardFooter>
        </Card>
    );
}
