import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Droplets } from "lucide-react";

export function PublicHeader() {
    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <Link className="flex items-center justify-center font-bold text-xl tracking-tighter text-blue-900" href="/">
                <Droplets className="h-6 w-6 mr-2" />
                FlowAudit
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                <SignedOut>
                    <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" href="/#features">
                        Features
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block" href="/#how-it-works">
                        How It Works
                    </Link>
                    {/* <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link> */}
                    <SignInButton mode="modal">
                        <Button variant="ghost" size="sm">Log In</Button>
                    </SignInButton>
                    <Link href="/sign-up">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </SignedOut>
                <SignedIn>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <UserButton />
                </SignedIn>
            </nav>
        </header>
    );
}
