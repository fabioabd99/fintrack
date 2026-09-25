import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/money";

// Formats an amount with an explicit sign (colour is optional).
export function Amount({
  cents,
  currency = "EUR",
  colored = true,
  className,
}: {
  cents: number;
  currency?: string;
  colored?: boolean;
  className?: string;
}) {
  // U+2212 minus, same width as digits
  const text = `${cents < 0 ? "−" : cents > 0 ? "+" : ""}${formatCents(
    Math.abs(cents),
    currency,
  )}`;

  return (
    <span
      className={cn(
        "tabular-nums",
        colored && cents > 0 && "text-positive",
        colored && cents < 0 && "text-negative",
        className,
      )}
    >
      {text}
    </span>
  );
}
