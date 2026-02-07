import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { cookies } from "next/headers"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="w-full">
                <div className="flex items-center gap-2 border-b p-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <span className="font-medium">Dashboard</span>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
