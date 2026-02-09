import { createCustomerPortalSession } from "@/app/actions/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function SubscriptionPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return <div>Please sign in</div>;
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    const isSubscribed = dbUser?.stripeCustomerId && dbUser?.isSubscribed;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
                <p className="text-muted-foreground">Manage your billing and plan details.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                        You are currently {isSubscribed ? "subscribed" : "not subscribed"} to the Pro plan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        {isSubscribed ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">
                                <XCircle className="h-4 w-4" />
                                <span>Inactive</span>
                            </div>
                        )}
                    </div>

                    {dbUser?.stripeCustomerId ? (
                        <form action={createCustomerPortalSession}>
                            <Button>Manage Subscription</Button>
                        </form>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No subscription record found. Please audit a building to verify functionality first.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
