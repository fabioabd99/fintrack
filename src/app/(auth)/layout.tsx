import { LedgerPanel } from "@/components/ledger-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <LedgerPanel />

      <main className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          {/* the side panel is hidden below lg */}
          <p className="mb-10 text-xs uppercase tracking-[0.18em] text-muted-foreground lg:hidden">
            Tillpay
          </p>

          {children}
        </div>
      </main>
    </div>
  );
}
