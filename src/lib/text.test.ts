import { describe, expect, it } from "vitest";
import { truncate } from "./text";

describe("truncate", () => {
  it("returns short text unchanged", () => {
    expect(truncate("hello", 160)).toBe("hello");
  });

  it("truncates long text and appends an ellipsis", () => {
    const long = "a".repeat(200);
    const result = truncate(long, 160);
    expect(result).toBe(`${"a".repeat(160)}…`);
  });

  it("trims trailing whitespace before the ellipsis", () => {
    const text = `${"a".repeat(159)} b`;
    expect(truncate(text, 160)).toBe(`${"a".repeat(159)}…`);
  });
});
