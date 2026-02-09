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
    CreditCard,
    LifeBuoy
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
import { SidebarUserFooter } from "./sidebar-user-footer"

import { User } from "next-auth"; // Ensure we have type or just use any

// Menu items.
const items = [
    {
        title: "My Audits",
        url: "/dashboard",
        icon: FileText,
    },
    {
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: CreditCard,
    },
    {
        title: "Support",
        url: "/dashboard/support",
        icon: LifeBuoy,
    },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null // Make sure role is accepted
    }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    // Create specific admin items
    const adminItems = [
        {
            title: "Admin Dashboard",
            url: "/dashboard/admin",
            icon: LayoutDashboard,
        }
    ]

    return (
        <Sidebar {...props}>
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
                            {/* Admin Links */}
                            {user?.role === "ADMIN" && adminItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="text-purple-600 font-medium">
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
                <SidebarUserFooter />
            </SidebarFooter>
        </Sidebar>
    )
}
