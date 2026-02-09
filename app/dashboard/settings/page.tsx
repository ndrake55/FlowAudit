import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createCustomerPortalSession } from "@/app/actions/stripe"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        redirect("/login")
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
    })

    if (!dbUser) {
        return <div>User not found.</div>
    }

    // Determine plan name (this is a simple check, could be more robust with a constants map)
    const planName = dbUser.isSubscribed ? "Pro Plan" : "Free Plan"


    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and subscription.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                        Manage your billing and subscription details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <label className="text-base font-medium">Current Plan</label>
                            <p className="text-sm text-muted-foreground">
                                You are currently on the <span className="font-semibold text-primary">{planName}</span>.
                            </p>
                            {dbUser.stripeCurrentPeriodEnd && (
                                <p className="text-xs text-muted-foreground">
                                    {dbUser.isSubscribed ? "Renews" : "Expires"} on {dbUser.stripeCurrentPeriodEnd.toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <form action={createCustomerPortalSession}>
                            <Button type="submit" variant="outline">
                                Manage Subscription
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
