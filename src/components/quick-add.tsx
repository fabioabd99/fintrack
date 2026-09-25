"use client";

import { Plus } from "lucide-react";
import { createContext, use, useEffect, useState } from "react";

import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string; kind?: string };

const QuickAddContext = createContext<(() => void) | null>(null);

// Shared add-transaction dialog: sidebar button, mobile FAB and the "N" shortcut.
export function QuickAddProvider({
  accounts,
  categories,
  children,
}: {
  accounts: Option[];
  categories: Option[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // "N" shortcut, ignored while typing or with modifiers
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "n" && event.key !== "N") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']") ||
        document.querySelector("[role='dialog']")
      ) {
        return;
      }

      event.preventDefault();
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <QuickAddContext value={() => setOpen(true)}>
      {children}

      <TransactionDialog
        accounts={accounts}
        categories={categories}
        open={open}
        onOpenChange={setOpen}
      />

      {/* mobile FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_8px_rgb(0_0_0/0.12),0_12px_28px_-8px_rgb(0_0_0/0.45)] md:hidden"
      >
        <Plus className="size-7" strokeWidth={2.5} aria-hidden />
      </button>
    </QuickAddContext>
  );
}

export function QuickAddButton() {
  const open = useQuickAdd();

  return (
    <Button className="h-11" onClick={open}>
      <Plus data-icon="inline-start" />
      Add transaction
    </Button>
  );
}

export function useQuickAdd() {
  const open = use(QuickAddContext);
  if (!open) throw new Error("useQuickAdd must be used inside QuickAddProvider");
  return open;
}
