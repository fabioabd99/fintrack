"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { capState } from "@/lib/cap-state";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCents, parseAmountToCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { BudgetProgress } from "@/server/queries/budgets";

type Option = { id: string; name: string; kind?: string };

export function BudgetManager({
  budgets,
  categories,
  month,
}: {
  budgets: BudgetProgress[];
  categories: Option[];
  month: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<BudgetProgress | null>(null);
  const [adding, setAdding] = useState(false);

  async function remove(budget: BudgetProgress) {
    await fetch(`/api/v1/budgets/${budget.id}`, { method: "DELETE" });
    router.refresh();
  }

  const spendable = categories.filter((c) => c.kind === "expense");
  const unbudgeted = spendable.filter(
    (category) => !budgets.some((b) => b.categoryId === category.id),
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Spending caps
          </h2>
          <p className="text-sm text-muted-foreground">
            A monthly limit per category. Going over it does not block anything,
            it just lets you know.
          </p>
        </div>

        <Button
          className="h-11"
          disabled={unbudgeted.length === 0}
          onClick={() => setAdding(true)}
        >
          <Plus data-icon="inline-start" />
          Set a cap
        </Button>
      </header>

      {budgets.length === 0 ? (
        <p className="rounded-3xl bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.10)] dark:bg-white/[0.04] dark:shadow-none dark:ring-1 dark:ring-white/[0.06] p-6 text-center text-muted-foreground">
          No caps set for this month.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {budgets.map((budget) => {
            const over = budget.spentCents > budget.limitCents;
            const left = budget.limitCents - budget.spentCents;
            const state = capState(budget.used);
            const standing = over
              ? `${formatCents(-left, "EUR")} over`
              : `${formatCents(left, "EUR")} left`;
            const standingTone = cn(
              "tabular-nums",
              state === "over" && "font-medium text-negative",
              state === "near" && "font-medium text-warning",
            );

            return (
              <li key={budget.id} className="rounded-3xl bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.10)] dark:bg-white/[0.04] dark:shadow-none dark:ring-1 dark:ring-white/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    category={budget.categoryName}
                    color={budget.color}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {budget.categoryName}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatCents(budget.spentCents, "EUR")} of{" "}
                      {formatCents(budget.limitCents, "EUR")}
                      <span className={cn("block sm:hidden", standingTone)}>
                        {standing}
                      </span>
                    </p>
                  </div>

                  <p
                    className={cn(
                      "hidden shrink-0 text-right text-sm sm:block",
                      standingTone,
                      state === "ok" && "text-muted-foreground",
                    )}
                  >
                    {standing}
                  </p>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      className="h-11"
                      onClick={() => setEditing(budget)}
                    >
                      Change
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label={`Remove the cap on ${budget.categoryName}`}
                      onClick={() => remove(budget)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                {/* capped at 100% */}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      state === "over" && "bg-negative",
                      state === "near" && "bg-warning",
                      state === "ok" && "bg-primary",
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(2, budget.used * 100))}%`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <BudgetDialog
          key="new"
          month={month}
          categories={unbudgeted}
          onDone={() => setAdding(false)}
          onSaved={() => router.refresh()}
        />
      ) : null}

      {editing ? (
        <BudgetDialog
          key={editing.id}
          month={month}
          budget={editing}
          categories={spendable}
          onDone={() => setEditing(null)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </section>
  );
}

function BudgetDialog({
  budget,
  categories,
  month,
  onDone,
  onSaved,
}: {
  budget?: BudgetProgress;
  categories: Option[];
  month: string;
  onDone: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(
    budget?.categoryId ?? categories[0]?.id ?? "",
  );
  const [amount, setAmount] = useState(
    budget ? (budget.limitCents / 100).toFixed(2) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    const cents = parseAmountToCents(amount);

    if (cents === null || cents <= 0) {
      setError("Enter an amount, like 250");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/v1/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        periodMonth: month,
        limitCents: cents,
      }),
    });
    setSaving(false);

    if (!response.ok) {
      setError("That did not save. Try again.");
      return;
    }

    onDone();
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onDone()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {budget ? "Change the cap" : "Set a spending cap"}
          </DialogTitle>
          <DialogDescription>
            How much you want to keep this category under, this month.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="budget-category">Category</FieldLabel>
            <Select
              value={categoryId}
              onValueChange={(value) => setCategoryId(String(value ?? ""))}
              disabled={!!budget}
            >
              <SelectTrigger id="budget-category" className="h-11">
                <SelectValue>
                  {(value) =>
                    categories.find((c) => c.id === value)?.name ??
                    budget?.categoryName ??
                    "Choose a category"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="budget-amount">Cap</FieldLabel>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              >
                €
              </span>
              <Input
                id="budget-amount"
                inputMode="decimal"
                autoComplete="off"
                className="h-11 pl-7 tabular-nums"
                placeholder="250.00"
                value={amount}
                aria-invalid={!!error}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError(null);
                }}
              />
            </div>
            {error ? <FieldDescription>{error}</FieldDescription> : null}
          </Field>
        </FieldGroup>

        <DialogFooter className="mt-4">
          <Button className="h-11" disabled={saving} onClick={save}>
            {budget ? "Save cap" : "Set cap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
