// Amounts are integer cents. Parsing accepts both "12.34" and "12,34": the last
// separator is the decimal one if followed by 1 or 2 digits, otherwise all
// separators are thousands separators.

const DIGITS_ONLY = /^\d+$/;
const GROUPED_DIGITS = /^\d{1,3}(?:[ ,.]\d{3})*$/;
const ALLOWED_CHARS = /^[\d ,.]+$/;
const DECIMAL_TAIL = /^\d{1,2}$/;

export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed === "") {
    return null;
  }

  const negative = trimmed.startsWith("-");
  const body = negative || trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;

  if (body === "" || !ALLOWED_CHARS.test(body)) {
    return null;
  }

  const lastSeparator = Math.max(body.lastIndexOf("."), body.lastIndexOf(","));
  const tail = lastSeparator === -1 ? "" : body.slice(lastSeparator + 1);
  const hasDecimals = lastSeparator !== -1 && DECIMAL_TAIL.test(tail);

  const wholePart = hasDecimals ? body.slice(0, lastSeparator) : body;
  const decimalPart = hasDecimals ? tail.padEnd(2, "0") : "00";

  if (wholePart !== "") {
    if (!DIGITS_ONLY.test(wholePart) && !GROUPED_DIGITS.test(wholePart)) {
      return null;
    }
  } else if (!hasDecimals) {
    return null;
  }

  const whole = wholePart.replace(/[ ,.]/g, "");
  const cents = Number(whole || "0") * 100 + Number(decimalPart);

  return negative ? -cents : cents;
}

export function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
