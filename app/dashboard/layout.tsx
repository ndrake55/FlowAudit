import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    const session = await getServerSession(authOptions)

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar user={session?.user} />
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
