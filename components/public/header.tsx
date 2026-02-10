"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Droplets } from "lucide-react";
import { UserAccountNav } from "@/components/user-account-nav";

export function PublicHeader() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <Link className="flex items-center justify-center font-bold text-xl tracking-tighter text-blue-900" href="/">
                <Droplets className="h-6 w-6 mr-2" />
                FlowAudit
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                {!session && !isLoading && (
                    <>
                        <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" href="/#features">
                            Features
                        </Link>
                        <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" href="/pricing">
                            Pricing
                        </Link>
                        <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" href="/#how-it-works">
                            How It Works
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </>
                )}
                {session && (
                    <>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <UserAccountNav />
                    </>
                )}
            </nav>
        </header>
    );
}
