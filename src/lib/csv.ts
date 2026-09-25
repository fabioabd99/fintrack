// CSV helpers for the export: RFC 4180 quoting plus formula injection
// protection (cells starting with = + - @ \t \r get a leading apostrophe).

const FORMULA_START = /^[=+\-@\t\r]/;

// "-1.00" starts with "-" but is a number, don't escape it
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;

export function csvCell(value: string | number | null): string {
  if (value === null) return "";

  const text = String(value);
  const isNumeric = typeof value === "number" || PLAIN_NUMBER.test(text);

  const safe =
    !isNumeric && FORMULA_START.test(text) ? `'${text}` : text;

  return `"${safe.replace(/"/g, '""')}"`;
}

export function csvRow(values: (string | number | null)[]): string {
  return `${values.map(csvCell).join(",")}\n`;
}
