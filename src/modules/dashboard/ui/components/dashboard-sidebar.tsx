'use client';
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardUserButton from "./dashboard-user-button";
import { DashboardTrial } from "./dashboard-trial";

const firstSection = [
    {
        icon: VideoIcon,
        label: "Meetings",
        href: "/meetings"
    },
    {
        icon: BotIcon,
        label: "Agents",
        href: "/agents"
    }
]
const secondSection = [
    {
        icon: StarIcon,
        label: "Upgrade",
        href: "/upgrade"
    }
]

export const DashboardSidebar = () => {
    const pathname = usePathname()
    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-2 px-2 pt-2">
                    <Image
                        src="/logo.svg"
                        alt="MeetGen.AI"
                        width={36}
                        height={36}
                    />
                    <p className="text-2xl font-semibold">MeetGen.AI</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className="opacity-20 text-[#655d6b]" />
            </div>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                firstSection.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            className={cn(
                                                "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#655d6b]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                                pathname === item.href && "bg-linear-to-r/oklch hover:border-[#655d6b]/10"
                                            )}
                                            isActive={pathname === item.href}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="size-5" />
                                                <span className="text-sm font-medium tracking-tight">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="px-4 py-2">
                    <Separator className="opacity-20 text-[#655d6b]" />
                </div>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                secondSection.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            className={cn(
                                                "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#655d6b]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                                pathname === item.href && "bg-linear-to-r/oklch hover:border-[#655d6b]/10"
                                            )}
                                            isActive={pathname === item.href}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="size-5" />
                                                <span className="text-sm font-medium tracking-tight">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-white">
                <DashboardTrial />
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    )
}
