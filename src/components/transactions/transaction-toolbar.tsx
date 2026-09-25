"use client";

import { ListFilter, Search, X } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCents, parseAmountToCents } from "@/lib/money";
import { TRANSACTION_TYPES } from "@/lib/validators/transaction";

const ALL = "all";

const TYPE_LABELS: Record<string, string> = {
  income: "Money in",
  expense: "Money out",
  transfer: "Transfers",
};

const parsers = {
  q: parseAsString.withDefault(""),
  type: parseAsStringLiteral(TRANSACTION_TYPES),
  accountIds: parseAsArrayOf(parseAsString).withDefault([]),
  categoryIds: parseAsArrayOf(parseAsString).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  minCents: parseAsInteger,
  maxCents: parseAsInteger,
  uncategorised: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
};

type Option = { id: string; name: string };

const nameOf = (options: Option[], id: string | null) =>
  options.find((option) => option.id === id)?.name;

export function TransactionToolbar({
  accounts,
  categories,
  hideAccountFilter = false,
}: {
  accounts: Option[];
  categories: Option[];
  hideAccountFilter?: boolean;
}) {
  const [filters, setFilters] = useQueryStates(parsers, {
    history: "replace",
    shallow: false,
  });

  const [search, setSearch] = useState(filters.q);

  // keep the input in sync when q is cleared from outside
  const [lastQ, setLastQ] = useState(filters.q);
  if (filters.q !== lastQ) {
    setLastQ(filters.q);
    setSearch(filters.q);
  }

  useEffect(() => {
    if (search === filters.q) return;
    const timer = setTimeout(
      () => void setFilters({ q: search || null, page: 1 }),
      300,
    );
    return () => clearTimeout(timer);
  }, [search, filters.q, setFilters]);

  const accountId = filters.accountIds[0] ?? null;
  const categoryId = filters.categoryIds[0] ?? null;

  const chips = [
    filters.type && {
      key: "type",
      label: TYPE_LABELS[filters.type],
      clear: { type: null },
    },
    !hideAccountFilter &&
      accountId && {
        key: "account",
        label: nameOf(accounts, accountId) ?? "Account",
        clear: { accountIds: null },
      },
    categoryId && {
      key: "category",
      label: nameOf(categories, categoryId) ?? "Category",
      clear: { categoryIds: null },
    },
    filters.from && {
      key: "from",
      label: `From ${filters.from}`,
      clear: { from: null },
    },
    filters.to && { key: "to", label: `To ${filters.to}`, clear: { to: null } },
    filters.minCents !== null && {
      key: "min",
      label: `Over ${formatCents(filters.minCents, "EUR")}`,
      clear: { minCents: null },
    },
    filters.maxCents !== null && {
      key: "max",
      label: `Under ${formatCents(filters.maxCents, "EUR")}`,
      clear: { maxCents: null },
    },
    filters.uncategorised && {
      key: "uncategorised",
      label: "Without a category",
      clear: { uncategorised: null },
    },
  ].filter(Boolean) as { key: string; label: string; clear: object }[];

  function setAmount(key: "minCents" | "maxCents", raw: string) {
    const trimmed = raw.trim();
    if (trimmed === "") return void setFilters({ [key]: null, page: 1 });

    const cents = parseAmountToCents(trimmed);
    if (cents !== null) void setFilters({ [key]: Math.abs(cents), page: 1 });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="h-11 pl-9"
            type="search"
            name="q"
            autoComplete="off"
            spellCheck={false}
            value={search}
            placeholder="Search your transactions…"
            aria-label="Search your transactions"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" className="h-11">
                <ListFilter data-icon="inline-start" />
                Filters
                {chips.length > 0 ? (
                  <Badge variant="secondary">{chips.length}</Badge>
                ) : null}
              </Button>
            }
          />

          <SheetContent className="flex flex-col gap-0">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow the list down. Everything here is optional.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="filter-type">Show</Label>
                <Select
                  value={filters.type ?? ALL}
                  onValueChange={(value) =>
                    void setFilters({
                      type: TRANSACTION_TYPES.includes(
                        value as (typeof TRANSACTION_TYPES)[number],
                      )
                        ? (value as (typeof TRANSACTION_TYPES)[number])
                        : null,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger id="filter-type" className="h-11">
                    <SelectValue>
                      {(value) => TYPE_LABELS[String(value)] ?? "Everything"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={ALL}>Everything</SelectItem>
                      <SelectItem value="income">Money in</SelectItem>
                      <SelectItem value="expense">Money out</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="flex flex-col gap-2"
                hidden={hideAccountFilter}
              >
                <Label htmlFor="filter-account">Account</Label>
                <Select
                  value={accountId ?? ALL}
                  onValueChange={(value) =>
                    void setFilters({
                      accountIds: !value || value === ALL ? [] : [value],
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger id="filter-account" className="h-11">
                    <SelectValue>
                      {(value) =>
                        nameOf(accounts, String(value)) ?? "Any account"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={ALL}>Any account</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="filter-category">Category</Label>
                <Select
                  value={categoryId ?? ALL}
                  onValueChange={(value) =>
                    void setFilters({
                      categoryIds: !value || value === ALL ? [] : [value],
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger id="filter-category" className="h-11">
                    <SelectValue>
                      {(value) =>
                        nameOf(categories, String(value)) ?? "Any category"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={ALL}>Any category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Dates</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-from" className="text-muted-foreground">
                      From
                    </Label>
                    <Input
                      id="filter-from"
                      type="date"
                      className="h-11"
                      value={filters.from}
                      onChange={(event) =>
                        void setFilters({
                          from: event.target.value || null,
                          page: 1,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-to" className="text-muted-foreground">
                      To
                    </Label>
                    <Input
                      id="filter-to"
                      type="date"
                      className="h-11"
                      value={filters.to}
                      onChange={(event) =>
                        void setFilters({
                          to: event.target.value || null,
                          page: 1,
                        })
                      }
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Amount</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-min" className="text-muted-foreground">
                      At least
                    </Label>
                    <Input
                      id="filter-min"
                      inputMode="decimal"
                      className="h-11"
                      placeholder="0.00"
                      defaultValue={
                        filters.minCents === null
                          ? ""
                          : (filters.minCents / 100).toFixed(2)
                      }
                      onBlur={(event) =>
                        setAmount("minCents", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="filter-max" className="text-muted-foreground">
                      At most
                    </Label>
                    <Input
                      id="filter-max"
                      inputMode="decimal"
                      className="h-11"
                      placeholder="0.00"
                      defaultValue={
                        filters.maxCents === null
                          ? ""
                          : (filters.maxCents / 100).toFixed(2)
                      }
                      onBlur={(event) =>
                        setAmount("maxCents", event.target.value)
                      }
                    />
                  </div>
                </div>
              </fieldset>
            </div>

            <SheetFooter>
              <SheetClose
                render={<Button className="h-11">Show results</Button>}
              />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Button
              key={chip.key}
              variant="secondary"
              size="sm"
              aria-label={`Remove filter: ${chip.label}`}
              onClick={() => void setFilters({ ...chip.clear, page: 1 })}
            >
              {chip.label}
              <X data-icon="inline-end" />
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void setFilters({
                q: null,
                type: null,
                accountIds: null,
                categoryIds: null,
                from: null,
                to: null,
                minCents: null,
                maxCents: null,
                uncategorised: null,
                page: 1,
              })
            }
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
