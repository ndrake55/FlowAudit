import Link from "next/link";
import { User, LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row bg-muted/40">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-col bg-background border-r hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <span className="text-xl font-bold tracking-tight text-primary">FlowAudit</span>
                    </Link>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 space-y-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/dashboard/audits">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <FileText className="h-4 w-4" />
                                Audits
                            </Button>
                        </Link>
                        <Link href="/dashboard/settings">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar (Mobile only mostly, plus User Profile) */}
                <header className="h-16 flex items-center justify-between px-6 border-b bg-background md:justify-end">
                    <div className="md:hidden">
                        <span className="font-bold">FlowAudit</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-medium">User Profile</p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
