import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import Link from "next/link";

import { Amount } from "@/components/amount";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { MonthlyChart } from "@/components/reports/monthly-chart";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/surface";
import { formatCents } from "@/lib/money";
import { requireUser } from "@/server/auth-context";
import {
  getMonthlyTrend,
  getSpendingByCategory,
} from "@/server/queries/reports";

export const metadata = { title: "Reports · Tillpay" };

const iso = (date: Date) => format(date, "yyyy-MM-dd");

const RANGES = [
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "12 months" },
] as const;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const user = await requireUser();
  const { months: raw } = await searchParams;

  const months = RANGES.some((range) => String(range.months) === raw)
    ? Number(raw)
    : 12;

  const periodStart = startOfMonth(subMonths(new Date(), months - 1));
  const periodEnd = endOfMonth(new Date());

  const [trend, byCategory] = await Promise.all([
    getMonthlyTrend(user.id, months),
    getSpendingByCategory(user.id, iso(periodStart), iso(periodEnd)),
  ]);

  const totals = trend.reduce(
    (sum, point) => ({
      income: sum.income + point.incomeCents,
      expense: sum.expense + point.expenseCents,
    }),
    { income: 0, expense: 0 },
  );

  const net = totals.income - totals.expense;
  // average over months with activity only
  const activeMonths =
    trend.filter((point) => point.incomeCents || point.expenseCents).length || 1;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 lg:py-10">
      <PageHeader
        title="Reports"
        description={`${format(periodStart, "MMMM yyyy")} to ${format(periodEnd, "MMMM yyyy")}`}
        action={
          <nav aria-label="Period" className="flex gap-1">
            {RANGES.map((range) => (
              <Link
                key={range.months}
                href={`/reports?months=${range.months}`}
                aria-current={range.months === months ? "page" : undefined}
                className={buttonVariants({
                  variant: range.months === months ? "secondary" : "ghost",
                  className: "h-11",
                })}
              >
                {range.label}
              </Link>
            ))}
          </nav>
        }
      />

      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Money in" value={<Amount cents={totals.income} />} />
        <Stat label="Money out" value={<Amount cents={-totals.expense} />} />
        <Stat
          label={net >= 0 ? "Kept" : "Short by"}
          value={<Amount cents={net} />}
          detail={`${formatCents(Math.round(totals.expense / activeMonths), "EUR")} a month on average`}
        />
      </dl>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Month by month
          </h2>
          <p className="text-sm text-muted-foreground">
            Above the line is money in, below it is money out. Transfers between
            your own accounts are left out of both.
          </p>
        </div>

        <div className="rounded-3xl bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.10)] dark:bg-white/[0.04] dark:shadow-none dark:ring-1 dark:ring-white/[0.06] p-4">
          <MonthlyChart points={trend} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Where it went
          </h2>
          <p className="text-sm text-muted-foreground">
            Spending by category across the whole period.
          </p>
        </div>

        <CategoryBreakdown rows={byCategory} />
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="rounded-3xl bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.10)] dark:bg-white/[0.04] dark:shadow-none dark:ring-1 dark:ring-white/[0.06] p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg">{value}</dd>
      {detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
