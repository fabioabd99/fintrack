import { describe, expect, it } from "vitest";

import { orderAccounts } from "./account-order";

describe("orderAccounts", () => {
  it("puts current accounts first, then savings, cash and cards", () => {
    const ordered = orderAccounts([
      { kind: "cash", name: "Cash" },
      { kind: "card", name: "Visa" },
      { kind: "savings", name: "Savings" },
      { kind: "checking", name: "Main Checking" },
    ]);

    expect(ordered.map((account) => account.kind)).toEqual([
      "checking",
      "savings",
      "cash",
      "card",
    ]);
  });

  it("orders accounts of the same kind by name, ignoring case", () => {
    const ordered = orderAccounts([
      { kind: "checking", name: "teste" },
      { kind: "checking", name: "Main Checking" },
    ]);

    expect(ordered.map((account) => account.name)).toEqual([
      "Main Checking",
      "teste",
    ]);
  });

  it("leaves the input untouched", () => {
    const input = [
      { kind: "cash" as const, name: "Cash" },
      { kind: "checking" as const, name: "Main" },
    ];
    orderAccounts(input);

    expect(input[0].name).toBe("Cash");
  });
});
