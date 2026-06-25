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
  Download
} from "lucide-react";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
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
        <section className="w-full py-16 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4 max-w-4xl">
                <Badge className="mb-2 px-5 py-2 text-sm bg-primary/10 text-primary border-none rounded-full" variant="secondary">
                  The Standard for Laundromat Due Diligence
                </Badge>
                <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.1] text-foreground">
                  Don't Buy a Lie.<br />
                  <span className="text-primary">Verify Revenue with Physics.</span>
                </h1>
                <p className="mx-auto max-w-[760px] text-muted-foreground text-lg md:text-xl leading-relaxed mt-6">
                  Sellers inflate their P&L. We prove the truth. Upload utility bills to calculate the exact wash volume and uncover "ghost income" before you make an offer.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-lg shadow-[var(--shadow-medium)] hover:-translate-y-0.5 transition-transform">
                    Start Forensic Audit
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full text-lg">
                    How It Works
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4 font-medium">
                No credit card required for initial analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="w-full py-12 bg-background border-y border-border">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <p className="text-xs text-muted-foreground mb-8 font-semibold uppercase tracking-widest">
              Trusted by Investors & Brokers Nationwide for Deal Verification
            </p>
            <div className="flex justify-center flex-wrap gap-8 md:gap-16 grayscale opacity-40 hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 font-heading font-bold text-xl text-foreground"><ShieldCheck className="size-6" /> SafeDeal</div>
              <div className="flex items-center gap-2 font-heading font-bold text-xl text-foreground"><BarChart3 className="size-6" /> AuditPro</div>
              <div className="flex items-center gap-2 font-heading font-bold text-xl text-foreground"><Search className="size-6" /> DiligenceAI</div>
              <div className="flex items-center gap-2 font-heading font-bold text-xl text-foreground"><Zap className="size-6" /> FastClose</div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="w-full py-20 md:py-32 bg-card">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
                  The "Cash Business" Trap
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Every laundromat seller says the same thing: "It makes way more than specific on the tax returns because it's a cash business."
                  <br /><br />
                  They might be telling the truth. Or they might be trying to sell you a dying business for a 5x multiple. Without verification, you're gambling.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[var(--destructive)]/10 p-3 rounded-full text-[var(--destructive)] mt-1 shrink-0">
                      <AlertTriangle className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-foreground mb-2">Inflated Coin Counts</h3>
                      <p className="text-muted-foreground">Spreadsheets are easy to edit. Currently, there is no way to verify "collections" notebooks.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-[var(--destructive)]/10 p-3 rounded-full text-[var(--destructive)] mt-1 shrink-0">
                      <AlertTriangle className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-foreground mb-2">Unreported Expenses</h3>
                      <p className="text-muted-foreground">Sellers often "forget" to include repair costs, part-time labor, and variable utility rates.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative mt-8 lg:mt-0">
                {/* Visual representation of a messy spreadsheet vs clean data */}
                <div className="bg-background p-8 rounded-[24px] shadow-[var(--shadow-large)] border border-border relative z-10 mx-4 md:mx-0">
                  <h3 className="font-heading text-xl font-bold mb-6 text-[var(--destructive)] flex items-center gap-2">
                    <AlertTriangle className="size-5" /> The Seller's Story
                  </h3>
                  <div className="space-y-4 opacity-40 blur-[2px] font-mono text-sm">
                    <div className="flex justify-between border-b pb-3"><span>Jan Revenue</span> <span>$12,500</span></div>
                    <div className="flex justify-between border-b pb-3"><span>Feb Revenue</span> <span>$13,200</span></div>
                    <div className="flex justify-between border-b pb-3"><span>Mar Revenue</span> <span>$11,800</span></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20 rounded-[24px]">
                    <div className="bg-[var(--destructive)] text-white px-8 py-3 rounded-full font-heading font-bold text-lg transform -rotate-12 shadow-[var(--shadow-medium)]">
                      UNVERIFIED
                    </div>
                  </div>
                </div>

                <div className="bg-foreground p-8 rounded-[24px] shadow-[var(--shadow-overlay)] relative z-20 -mt-12 ml-12 md:ml-20 text-background border border-gray-800">
                  <h3 className="font-heading text-xl font-bold mb-6 text-[var(--success)] flex items-center gap-2">
                    <Check className="size-5" /> The FlowAudit Reality
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-800 pb-3"><span>Water Usage Analysis</span> <span className="text-[var(--success)] font-mono font-bold">CONFIRMED</span></div>
                    <div className="flex justify-between border-b border-gray-800 pb-3"><span>Max Capacity Check</span> <span className="text-[var(--success)] font-mono font-bold">PASSED</span></div>
                    <div className="flex justify-between pt-2 font-heading font-bold text-2xl"><span>True Revenue</span> <span>$8,450</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-20 md:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground mb-6">
                Forensic Auditing made Simple
              </h2>
              <p className="text-muted-foreground text-xl">
                We use the law of conservation of mass. Water in = Money out. It's that simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-[var(--shadow-medium)] bg-card hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="flex flex-col items-center text-center pt-[18px]">
                  <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <FileText className="size-10 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-4">1. Upload Utility Bills</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Drag and drop 12-24 months of water bills or a Profit and Loss statement. Our AI automatically extracts usage data, dates, and costs accurately.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[var(--shadow-medium)] bg-card hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="flex flex-col items-center text-center pt-[18px]">
                  <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <Calculator className="size-10 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-4">2. Input Machine Mix</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Tell us what machines are in the store (e.g., 20x Top Loaders, 10x 60lb Washers). We use manufacturer specs to determine water-per-turn.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[var(--shadow-medium)] bg-card hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="flex flex-col items-center text-center pt-[18px]">
                  <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <Search className="size-10 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-4">3. Discover the Truth</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    We calculate how many turns were physically possible given the water usage. If they claim more revenue than water allows, you know it's a lie.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Deep Dive */}
        <section id="features" className="w-full py-20 md:py-32 bg-foreground text-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-background">
                    Advanced Forensic Tools
                  </h2>
                  <p className="text-gray-400 text-xl leading-relaxed">
                    FlowAudit goes beyond simple spreadsheets. We use advanced algorithms to detect anomalies that human auditors miss.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="bg-primary/20 p-4 rounded-[16px] h-fit shrink-0">
                      <Droplets className="size-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl mb-2 text-background">Water Bill Reverse Engineering</h3>
                      <p className="text-gray-400 text-lg">
                        We map water usage seasonality against revenue claims to ensure they correlate.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="bg-[var(--warning)]/20 p-4 rounded-[16px] h-fit shrink-0">
                      <AlertTriangle className="size-8 text-[var(--warning)]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl mb-2 text-background">Ghost Income Detector</h3>
                      <p className="text-gray-400 text-lg">
                        The system flags specific months where the "Washer Revenue" implies more water than was actually billed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="bg-[var(--success)]/20 p-4 rounded-[16px] h-fit shrink-0">
                      <Download className="size-8 text-[var(--success)]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-2xl mb-2 text-background">Bank-Ready PDF Reports</h3>
                      <p className="text-gray-400 text-lg">
                        Generate professional reports to attach to your LOI or loan application. Show the seller you mean business.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Visual */}
              <div className="bg-gray-800 rounded-[24px] p-2 md:p-4 border border-gray-700 shadow-[var(--shadow-overlay)]">
                <div className="bg-gray-900 rounded-[20px] p-8 space-y-8">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-6">
                    <div>
                      <p className="text-sm text-gray-400 uppercase font-mono tracking-wider mb-2">Analysis Result</p>
                      <h4 className="font-heading text-3xl font-bold text-white">Revenue Discrepancy</h4>
                    </div>
                    <Badge variant="destructive" className="bg-[var(--destructive)]/20 text-[var(--destructive)] border-[var(--destructive)]/50 px-4 py-1 text-sm rounded-full">High Risk</Badge>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-base mb-3">
                        <span className="text-gray-400">Seller Claimed Revenue</span>
                        <span className="text-white font-mono font-bold">$185,000</span>
                      </div>
                      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--destructive)] w-[90%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-base mb-3">
                        <span className="text-gray-400">Physics-Based Max Revenue</span>
                        <span className="text-white font-mono font-bold">$142,000</span>
                      </div>
                      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--success)] w-[70%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 rounded-[16px]">
                    <p className="text-base text-[var(--destructive)] font-medium">
                      <AlertTriangle className="inline size-5 mr-2 mb-1" />
                      Warning: Claimed revenue exceeds physical water capacity by 23%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits/CTA */}
        <section className="w-full py-20 md:py-32 bg-primary text-primary-foreground text-center">
          <div className="container px-4 md:px-6 mx-auto">
            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-8 max-w-3xl mx-auto">
              Ready to catch a bad deal before it costs you?
            </h2>
            <p className="text-primary-foreground/90 max-w-2xl mx-auto text-xl mb-12">
              Join smart investors who use FlowAudit to verify every single laundromat purchase.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="bg-background text-primary hover:bg-background/90 w-full sm:w-auto shadow-[var(--shadow-medium)] hover:-translate-y-0.5 transition-transform text-lg">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-20 md:py-32 bg-card">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <h2 className="font-heading text-4xl font-bold text-center mb-16 text-foreground">Frequently Asked Questions</h2>
            <div className="grid gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">What documents do I need?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-base leading-relaxed">
                  You primarily need the water bills for the past 12-24 months. A Profit and Loss Statement is also helpful for verifying revenue claims. If you have the equipment mix (list of machines), that is required for the calculation.
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">How accurate is the analysis?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-base leading-relaxed">
                  It is extremely accurate because it is based on physics. A specific machine model uses a specific amount of water per cycle. By knowing the total water usage, we can mathematically determine the maximum number of cycles that occurred, and thus the maximum possible revenue.
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-xl">Can I use this for negotiation?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-base leading-relaxed">
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
