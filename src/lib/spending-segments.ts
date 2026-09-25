export type SpendingSegment = {
  id: string;
  name: string;
  color: string | null;
  cents: number;
};

// Largest categories for the Home spending bar, the rest grouped as "Other".
export function spendingSegments(
  rows: readonly { id: string; name: string; color: string | null; thisMonthCents: number }[],
  totalCents: number,
  max = 4,
): SpendingSegment[] {
  const top = [...rows]
    .sort((a, b) => b.thisMonthCents - a.thisMonthCents)
    .slice(0, max)
    .map((row) => ({ id: row.id, name: row.name, color: row.color, cents: row.thisMonthCents }));

  const rest = totalCents - top.reduce((sum, segment) => sum + segment.cents, 0);

  return rest > 0 ? [...top, { id: "other", name: "Other", color: null, cents: rest }] : top;
}
