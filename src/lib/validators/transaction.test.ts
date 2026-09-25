import { describe, expect, test } from "vitest";

import { parseTransactionFilters } from "./transaction";

const UUID_A = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const UUID_B = "9c858901-8a57-4791-81fe-4c455b099bc9";

describe("parseTransactionFilters", () => {
  test("applies defaults when nothing is given", () => {
    expect(parseTransactionFilters({})).toMatchObject({
      accountIds: [],
      categoryIds: [],
      uncategorised: false,
      sort: "occurredOn",
      dir: "desc",
      page: 1,
      pageSize: 25,
    });
  });

  test("one invalid field does not discard the others", () => {
    const filters = parseTransactionFilters({ type: "income", pageSize: "2" });

    expect(filters.type).toBe("income");
    expect(filters.pageSize).toBe(25);
  });

  test("keeps a valid page size", () => {
    expect(parseTransactionFilters({ pageSize: "50" }).pageSize).toBe(50);
  });

  test("reads comma-separated ids", () => {
    expect(
      parseTransactionFilters({ accountIds: `${UUID_A},${UUID_B}` }).accountIds,
    ).toEqual([UUID_A, UUID_B]);
  });

  test("drops ids that are not uuids without dropping other filters", () => {
    const filters = parseTransactionFilters({
      accountIds: "not-a-uuid",
      type: "expense",
    });

    expect(filters.accountIds).toEqual([]);
    expect(filters.type).toBe("expense");
  });

  test("treats the string 'false' as false", () => {
    expect(parseTransactionFilters({ uncategorised: "false" }).uncategorised).toBe(
      false,
    );
  });

  test("treats the string 'true' as true", () => {
    expect(parseTransactionFilters({ uncategorised: "true" }).uncategorised).toBe(
      true,
    );
  });

  test("rejects an unknown sort field", () => {
    expect(parseTransactionFilters({ sort: "userId" }).sort).toBe("occurredOn");
  });

  test("rejects a page below one", () => {
    expect(parseTransactionFilters({ page: "0" }).page).toBe(1);
  });

  test("ignores a malformed date without losing the other bound", () => {
    const filters = parseTransactionFilters({
      from: "31-12-2026",
      to: "2026-12-31",
    });

    expect(filters.from).toBeUndefined();
    expect(filters.to).toBe("2026-12-31");
  });
});
