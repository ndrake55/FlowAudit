import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flowaudit.com"), // TODO: Update with actual domain when live
  title: {
    default: "FlowAudit | AI-Powered Laundromat Due Diligence",
    template: "%s | FlowAudit"
  },
  description: "Verify laundromat revenue with physics. FlowAudit analyzes utility bills to uncover ghost income and calculate exact wash volume for investors and brokers.",
  keywords: ["laundromat due diligence", "laundromat audit", "laundromat revenue verification", "utility bill analysis", "laundromat valuation", "FlowAudit"],
  authors: [{ name: "FlowAudit Inc." }],
  creator: "FlowAudit Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flowaudit.com",
    title: "FlowAudit | Verify Laundromat Revenue",
    description: "Don't buy a lie. Use AI to verify laundromat income using water and gas bills.",
    siteName: "FlowAudit",
    images: [
      {
        url: "/og-image.png", // We will need to ensure this exists or use opengraph-image.tsx
        width: 1200,
        height: 630,
        alt: "FlowAudit Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowAudit | Laundromat Forensics",
    description: "Verify laundromat revenue with physics. Stop buying bad deals.",
    images: ["/og-image.png"],
    creator: "@flowaudit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
