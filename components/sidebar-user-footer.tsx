"use client"

import { LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SidebarUserFooter() {
    const { data: session } = useSession()

    if (!session) {
        return null
    }

    const userInitials = session.user?.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U"

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <a href="/dashboard/settings">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                            <AvatarFallback className="rounded-lg">
                                {session.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{session.user?.name}</span>
                            <span className="truncate text-xs">{session.user?.email}</span>
                        </div>
                    </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2 border border-red-200 justify-center"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
