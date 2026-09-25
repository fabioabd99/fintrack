"use client";

import {
  ChartColumn,
  House,
  Menu,
  Plus,
  Repeat,
  Settings,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand, BrandMark } from "@/components/brand";
import { useQuickAdd } from "@/components/quick-add";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/transactions", label: "Accounts", icon: Wallet },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/recurring", label: "Repeating", icon: Repeat },
  { href: "/reports", label: "Reports", icon: ChartColumn },
] as const;

const NAV_ITEM =
  "h-10 gap-3 rounded-lg px-3 text-[0.9375rem] text-sidebar-foreground transition-colors duration-150 [&_svg]:size-[1.125rem] [&_svg]:text-muted-foreground data-active:bg-sidebar-active data-active:text-foreground data-active:shadow-[0_1px_2px_oklch(0_0_0/0.06),0_0_0_1px_var(--sidebar-border)] data-active:[&_svg]:text-primary";

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppSidebar({
  name,
  email,
  isDemo,
}: {
  name: string;
  email: string;
  isDemo: boolean;
}) {
  const pathname = usePathname();
  const quickAdd = useQuickAdd();
  const { setOpenMobile } = useSidebar();

  // close the mobile sheet before opening the dialog
  function openQuickAdd() {
    setOpenMobile(false);
    quickAdd();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <Link
          href="/"
          aria-label="Tillpay home"
          className="flex h-10 items-center rounded-lg px-2 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Brand className="group-data-[collapsible=icon]:hidden" />
          <BrandMark className="hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup className="px-3 pt-2 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={openQuickAdd}
                tooltip="Add transaction (N)"
                className="h-10 gap-2 rounded-lg bg-primary px-3 text-[0.9375rem] font-medium text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.15),0_1px_2px_oklch(0_0_0/0.12)] transition-[background-color,transform] duration-150 hover:bg-primary/90 hover:text-primary-foreground active:scale-[0.98] active:bg-primary/90 active:text-primary-foreground [&_svg]:size-[1.125rem]"
              >
                <Plus strokeWidth={2.5} />
                <span className="flex-1">Add transaction</span>
                <kbd className="hidden h-5 min-w-5 items-center justify-center rounded border border-white/25 px-1 font-sans text-xs font-medium text-primary-foreground/85 md:inline-flex">
                  N
                </kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    tooltip={item.label}
                    isActive={isCurrent(pathname, item.href)}
                    className={NAV_ITEM}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto px-3 pb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/settings" />}
                tooltip="Settings"
                isActive={isCurrent(pathname, "/settings")}
                className={NAV_ITEM}
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu name={name} email={email} isDemo={isDemo} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 [&_svg:not([class*='size-'])]:size-6"
      aria-label="Open menu"
      onClick={toggleSidebar}
    >
      <Menu />
    </Button>
  );
}
