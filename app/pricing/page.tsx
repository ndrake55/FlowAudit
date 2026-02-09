import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Droplets } from "lucide-react";
import { STRIPE_PRICES } from "@/lib/stripe-constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserAccountNav } from "@/components/user-account-nav";
import { PricingCard } from "@/components/pricing-card";

export default async function PricingPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <Link className="flex items-center justify-center font-bold text-xl tracking-tighter text-blue-900" href="/">
                    <Droplets className="h-6 w-6 mr-2" />
                    FlowAudit
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                    {!session ? (
                        <>
                            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#features">
                                Features
                            </Link>
                            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
                                Pricing
                            </Link>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Log In</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <UserAccountNav />
                        </>
                    )}
                </nav>
            </header>

            <main className="flex-1 bg-gray-50 py-12 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-blue-950">
                                Invest with Confidence
                            </h1>
                            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Don't let a bad laundromat deal drain your capital. Verify the revenue before you make an offer.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <PricingCard
                            title="Single Forensic Audit"
                            description="Perfect for vetting one specific laundromat listing."
                            price="$499"
                            priceSuffix=" / one-time"
                            features={[
                                "Full Revenue Reconstruction Report",
                                "24-Month Water Bill Analysis",
                                "Bank-Ready PDF Export",
                                "Negotiation Script Included"
                            ]}
                            buttonText="Audit One Deal"
                            priceId={STRIPE_PRICES.single_deal}
                            mode="payment"
                        />

                        <PricingCard
                            title="Active Searcher Plan"
                            description="For investors actively analyzing multiple deals."
                            price="$199"
                            priceSuffix=" / month"
                            features={[
                                "<span class='font-semibold'>Unlimited</span> Forensic Audits",
                                "Compare Multiple Locations",
                                "Priority Processing",
                                "Cancel anytime"
                            ]}
                            buttonText="Start Subscription"
                            priceId={STRIPE_PRICES.searcher_plan}
                            mode="subscription"
                            popular={true}
                        />
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500">
                            Need a custom enterprise plan for a large portfolio? <Link href="#" className="underline hover:text-blue-600">Contact Sales</Link>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-light text-xs text-gray-500 bg-white">
                <p>© 2026 FlowAudit Inc. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="hover:underline underline-offset-4" href="#">Terms of Service</Link>
                    <Link className="hover:underline underline-offset-4" href="#">Privacy</Link>
                </nav>
            </footer>
        </div>
    );
}
