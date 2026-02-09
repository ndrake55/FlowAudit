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
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{session.user?.name}</span>
                        <span className="truncate text-xs">{session.user?.email}</span>
                    </div>
                    <div onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <LogOut className="ml-auto size-4" />
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
