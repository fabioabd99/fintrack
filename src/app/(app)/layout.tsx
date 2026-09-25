import type { Metadata } from "next";

import Link from "next/link";

import { AppSidebar, MobileMenuButton } from "@/components/app-sidebar";
import { Brand } from "@/components/brand";
import { QuickAddProvider } from "@/components/quick-add";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { orderAccounts } from "@/lib/account-order";
import { requireUser } from "@/server/auth-context";
import {
  listAccountBalances,
  listCategoriesForUser,
} from "@/server/queries/transactions";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // proxy.ts only checks for a cookie, this is the real check
  const user = await requireUser();

  // needed by the quick add dialog on every page
  const [accountBalances, categories] = await Promise.all([
    listAccountBalances(user.id),
    listCategoriesForUser(user.id),
  ]);
  const accounts = orderAccounts(accountBalances).map(({ id, name, kind }) => ({
    id,
    name,
    kind,
  }));

  return (
    <SidebarProvider>
      <QuickAddProvider accounts={accounts} categories={categories}>
        <AppSidebar name={user.name} email={user.email} isDemo={Boolean(user.isDemo)} />

        <SidebarInset>
          {/* mobile only, on desktop the sidebar is always visible */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b bg-background/85 px-2 backdrop-blur-md md:hidden">
            <MobileMenuButton />
            <Link href="/" aria-label="Tillpay home" className="rounded-lg px-1 py-1.5">
              <Brand />
            </Link>
          </header>

          {/* space for the floating add button on mobile */}
          <div className="pb-24 md:pb-0">{children}</div>
        </SidebarInset>
      </QuickAddProvider>
    </SidebarProvider>
  );
}
