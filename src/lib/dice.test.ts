import { describe, expect, it } from "vitest";
import { parseNotation, roll } from "./dice";

// A deterministic RNG: cycles through fixed values so rolls are predictable.
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("parseNotation", () => {
  it("parses a single die", () => {
    expect(parseNotation("d20")).toEqual({ groups: [{ count: 1, sides: 20 }], modifier: 0 });
  });

  it("parses count and modifier", () => {
    expect(parseNotation("2d6+3")).toEqual({ groups: [{ count: 2, sides: 6 }], modifier: 3 });
  });

  it("parses a negative modifier", () => {
    expect(parseNotation("1d100-5")).toEqual({ groups: [{ count: 1, sides: 100 }], modifier: -5 });
  });

  it("parses multiple groups", () => {
    expect(parseNotation("2d6+1d8")).toEqual({
      groups: [{ count: 2, sides: 6 }, { count: 1, sides: 8 }],
      modifier: 0,
    });
  });

  it("rejects garbage", () => {
    expect(() => parseNotation("hello")).toThrow();
    expect(() => parseNotation("2x6")).toThrow();
    expect(() => parseNotation("d1")).toThrow(); // sides must be >= 2
  });
});

describe("roll", () => {
  it("applies rng and modifier", () => {
    // rng=0 -> value 1 on every die; 2d6 -> 1+1, +3 = 5
    const r = roll("2d6+3", seq([0]));
    expect(r.rolls).toEqual([
      { sides: 6, value: 1 },
      { sides: 6, value: 1 },
    ]);
    expect(r.total).toBe(5);
  });

  it("rolls the max face when rng approaches 1", () => {
    const r = roll("1d20", seq([0.999999]));
    expect(r.rolls[0].value).toBe(20);
    expect(r.total).toBe(20);
  });

  it("stays within bounds across many rolls", () => {
    for (let i = 0; i < 200; i++) {
      const r = roll("3d8+2");
      expect(r.total).toBeGreaterThanOrEqual(3 + 2);
      expect(r.total).toBeLessThanOrEqual(24 + 2);
    }
  });
});
