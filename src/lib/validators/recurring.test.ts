import { describe, expect, it } from "vitest";

import { recurringRuleInputSchema } from "./recurring";

const salary = {
  accountId: "0b6f3f5e-8a0e-4c5e-9a4a-2f1d3c4b5a69",
  description: "Salary",
  type: "income",
  amountCents: 250000,
  frequency: "monthly",
  dayOfMonth: 25,
  startsOn: "2026-10-25",
};

describe("recurringRuleInputSchema", () => {
  it("is not a salary unless asked", () => {
    const parsed = recurringRuleInputSchema.parse({ ...salary });
    expect(parsed.isSalary).toBe(false);
  });

  it("accepts an income marked as salary", () => {
    const parsed = recurringRuleInputSchema.parse({ ...salary, isSalary: true });
    expect(parsed.isSalary).toBe(true);
  });

  it("rejects an expense marked as salary", () => {
    const result = recurringRuleInputSchema.safeParse({
      ...salary,
      type: "expense",
      amountCents: -95000,
      isSalary: true,
    });
    expect(result.success).toBe(false);
  });
});
