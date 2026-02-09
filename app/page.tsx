import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Droplets,
  FileText,
  ShieldCheck,
  Zap,
  Search,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Lock,
  Download
} from "lucide-react";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "FlowAudit",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
            "description": "AI-powered due diligence tool for laundromat investors. Verify revenue using utility bills.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "120"
            }
          }),
        }}
      />
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="mb-4 px-4 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 border-none" variant="secondary">
                  The Standard for Laundromat Due Diligence
                </Badge>
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-blue-950 max-w-4xl mx-auto">
                  Don't Buy a Lie.<br />
                  <span className="text-blue-600">Verify Revenue with Physics.</span>
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl dark:text-gray-400 mt-4 leading-relaxed">
                  Sellers inflate their P&L. We prove the truth. Upload utility bills to calculate the exact wash volume and uncover "ghost income" before you make an offer.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
                    Start Forensic Audit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-blue-200 text-blue-900 hover:bg-blue-50">
                    How It Works
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                No credit card required for initial analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="w-full py-12 bg-white border-y">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <p className="text-sm text-gray-500 mb-8 font-medium uppercase tracking-widest">
              Trusted by Investors & Brokers Nationwide for Deal Verification
            </p>
            <div className="flex justify-center flex-wrap gap-8 md:gap-16 grayscale opacity-40 hover:opacity-100 transition-opacity">
              {/* Placeholders for logos - keeping it text based for now as requested */}
              <div className="flex items-center gap-2 font-bold text-xl"><ShieldCheck className="h-6 w-6" /> SafeDeal</div>
              <div className="flex items-center gap-2 font-bold text-xl"><BarChart3 className="h-6 w-6" /> AuditPro</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Search className="h-6 w-6" /> DiligenceAI</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> FastClose</div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-950">
                  The "Cash Business" Trap
                </h2>
                <p className="text-gray-500 text-lg">
                  Every laundromat seller says the same thing: "It makes way more than specific on the tax returns because it's a cash business."
                  <br /><br />
                  They might be telling the truth. Or they might be trying to sell you a dying business for a 5x multiple. Without verification, you're gambling.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 mt-1">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Inflated Coin Counts</h3>
                      <p className="text-gray-500">Spreadsheets are easy to edit. Currently, there is no way to verify "collections" notebooks.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 mt-1">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Unreported Expenses</h3>
                      <p className="text-gray-500">Sellers often "forget" to include repair costs, part-time labor, and variable utility rates.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                {/* Visual representation of a messy spreadsheet vs clean data */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> The Seller's Story
                  </h3>
                  <div className="space-y-3 opacity-50 blur-[1px]">
                    <div className="flex justify-between border-b pb-2"><span>Jan Revenue</span> <span>$12,500</span></div>
                    <div className="flex justify-between border-b pb-2"><span>Feb Revenue</span> <span>$13,200</span></div>
                    <div className="flex justify-between border-b pb-2"><span>Mar Revenue</span> <span>$11,800</span></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                    <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold transform -rotate-12 shadow-lg">
                      UNVERIFIED
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900 p-8 rounded-2xl shadow-xl border border-blue-800 relative z-20 -mt-10 ml-8 md:ml-12 text-white">
                  <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                    <Check className="h-5 w-5" /> The FlowAudit Reality
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-blue-700 pb-2"><span>Water Usage Analysis</span> <span className="text-green-400 font-mono">CONFIRMED</span></div>
                    <div className="flex justify-between border-b border-blue-700 pb-2"><span>Max Capacity Check</span> <span className="text-green-400 font-mono">PASSED</span></div>
                    <div className="flex justify-between pb-2 font-bold text-lg"><span>True Revenue</span> <span>$8,450</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-950 mb-4">
                Forensic Auditing made Simple
              </h2>
              <p className="text-gray-500 text-lg">
                We use the law of conservation of mass. Water in = Money out. It's that simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Upload Utility Bills</h3>
                <p className="text-gray-600">
                  Drag and drop 12-24 months of water bills or a Profit and Loss statement. Our AI automatically extracts usage data, dates, and costs accurately.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Imput Machine Mix</h3>
                <p className="text-gray-600">
                  Tell us what machines are in the store (e.g., 20x Top Loaders, 10x 60lb Washers). We use manufacturer specs to determine water-per-turn.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Discover the Truth</h3>
                <p className="text-gray-600">
                  We calculate how many turns were physically possible given the water usage. If they claim more revenue than water allows, you know it's a lie.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Deep Dive */}
        <section id="features" className="w-full py-16 md:py-24 bg-gray-900 text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
                    Advanced Forensic Tools
                  </h2>
                  <p className="text-gray-400 text-lg">
                    FlowAudit goes beyond simple spreadsheets. We use advanced algorithms to detect anomalies that human auditors miss.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg h-fit">
                      <Droplets className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Water Bill Reverse Engineering</h3>
                      <p className="text-gray-400">
                        We map water usage seasonality against revenue claims to ensure they correlate.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg h-fit">
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Ghost Income Detector</h3>
                      <p className="text-gray-400">
                        The system flags specific months where the "Washer Revenue" implies more water than was actually billed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-blue-600/20 p-3 rounded-lg h-fit">
                      <Download className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Bank-Ready PDF Reports</h3>
                      <p className="text-gray-400">
                        Generate professional reports to attach to your LOI or loan application. Show the seller you mean business.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Visual */}
              <div className="bg-gray-800 rounded-xl p-2 md:p-4 border border-gray-700 shadow-2xl">
                <div className="bg-gray-900 rounded-lg p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-mono">Analysis Result</p>
                      <h4 className="text-2xl font-bold text-white">Revenue Discrepancy</h4>
                    </div>
                    <Badge variant="destructive" className="bg-red-900/50 text-red-400 border-red-900">High Risk</Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Seller Claimed Revenue</span>
                        <span className="text-white font-mono">$185,000</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-[90%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Physics-Based Max Revenue</span>
                        <span className="text-white font-mono">$142,000</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[70%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
                    <p className="text-sm text-red-200">
                      <AlertTriangle className="inline h-4 w-4 mr-1 mb-1" />
                      Warning: Claimed revenue exceeds physical water capacity by 23%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits/CTA */}
        <section className="w-full py-16 md:py-24 bg-blue-600 text-white text-center">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Ready to catch a bad deal before it costs you?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-8">
              Join smart investors who use FlowAudit to verify every Single laundromat purchase.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 text-lg w-full sm:w-auto">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-blue-950">Frequently Asked Questions</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What documents do I need?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  You primarily need the water bills for the past 12-24 months. A Profit and Loss Statement is also helpful for verifying revenue claims. If you have the equipment mix (list of machines), that is required for the calculation.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How accurate is the analysis?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  It is extremely accurate because it is based on physics. A specific machine model uses a specific amount of water per cycle. By knowing the total water usage, we can mathematically determine the maximum number of cycles that occurred, and thus the maximum possible revenue.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I use this for negotiation?</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600">
                  Absolutely. That is the primary use case. Our users often use the "Discrepancy Report" to ask sellers to explain the gap between claimed income and water usage. This often leads to price reductions or walking away from a fraudulent deal.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
