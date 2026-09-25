import { describe, expect, test } from "vitest";

import { csvCell, csvRow } from "./csv";

describe("csvCell", () => {
  test("quotes a plain value", () => {
    expect(csvCell("Supermarket")).toBe('"Supermarket"');
  });

  test("returns an empty field for null", () => {
    expect(csvCell(null)).toBe("");
  });

  test("doubles an embedded quote", () => {
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""');
  });

  test("keeps a comma inside the field", () => {
    expect(csvCell("Rent, October")).toBe('"Rent, October"');
  });

  test("keeps a newline inside the field", () => {
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
  });

  describe("formula injection", () => {
    // spreadsheets run cells starting with = + - @ \t \r as formulas
    test("neutralises a leading equals sign", () => {
      expect(csvCell("=1+1")).toBe("\"'=1+1\"");
    });

    test("neutralises HYPERLINK exfiltration", () => {
      expect(csvCell('=HYPERLINK("http://evil","Click")')).toBe(
        "\"'=HYPERLINK(\"\"http://evil\"\",\"\"Click\"\")\"",
      );
    });

    test("neutralises a leading plus", () => {
      expect(csvCell("+1+1")).toBe("\"'+1+1\"");
    });

    test("neutralises a leading minus", () => {
      expect(csvCell("-1+1")).toBe("\"'-1+1\"");
    });

    test("neutralises a leading at sign", () => {
      expect(csvCell("@SUM(A1:A9)")).toBe("\"'@SUM(A1:A9)\"");
    });

    test("neutralises a leading tab", () => {
      expect(csvCell("\t=1+1")).toBe("\"'\t=1+1\"");
    });

    test("neutralises a leading carriage return", () => {
      expect(csvCell("\r=1+1")).toBe("\"'\r=1+1\"");
    });

    test("neutralises a DDE payload", () => {
      expect(csvCell("=cmd|'/c calc'!A1")).toBe("\"'=cmd|'/c calc'!A1\"");
    });

    test("leaves an equals sign that is not leading alone", () => {
      expect(csvCell("Total = 10")).toBe('"Total = 10"');
    });

    test("leaves a negative amount alone", () => {
      expect(csvCell(-1234)).toBe('"-1234"');
    });

    test("leaves a formatted negative amount alone", () => {
      expect(csvCell("-1.00")).toBe('"-1.00"');
    });

    test("still neutralises a formula that begins like a negative number", () => {
      expect(csvCell("-1+1")).toBe("\"'-1+1\"");
      expect(csvCell("-2*A1")).toBe("\"'-2*A1\"");
    });
  });
});

describe("csvRow", () => {
  test("joins cells with commas and ends the line", () => {
    expect(csvRow(["a", "b", null])).toBe('"a","b",\n');
  });

  test("neutralises a formula anywhere in the row, not only the first cell", () => {
    expect(csvRow(["ok", "=1+1"])).toBe("\"ok\",\"'=1+1\"\n");
  });
});
