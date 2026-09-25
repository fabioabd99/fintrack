type Orderable = { kind: "checking" | "savings" | "cash" | "card"; name: string };

const ORDER = { checking: 0, savings: 1, cash: 2, card: 3 } as const;

// checking, savings, cash, card, then by name
export function orderAccounts<T extends Orderable>(accounts: readonly T[]): T[] {
  return [...accounts].sort(
    (a, b) => ORDER[a.kind] - ORDER[b.kind] || a.name.localeCompare(b.name),
  );
}
