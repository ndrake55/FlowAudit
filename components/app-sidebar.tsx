"use strict";

import {
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    Droplets,
    FileText,
    LayoutDashboard,
    CreditCard
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter
} from "@/components/ui/sidebar"
import { UserAccountNav } from "./user-account-nav"

// Menu items.
const items = [
    {
        title: "My Audits",
        url: "/dashboard",
        icon: FileText, // Or Home/LayoutDashboard
    },
    {
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: CreditCard,
    },
    // Settings moved to footer

]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <h1 className="text-xl font-bold tracking-tight">FlowAudit</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/dashboard/settings">
                                <Settings />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <UserAccountNav />
            </SidebarFooter>
        </Sidebar>
    )
}
