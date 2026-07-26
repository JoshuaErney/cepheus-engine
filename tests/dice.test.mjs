import { describe, expect, test } from "bun:test";
import { normalizeDiceFormula, isDiceFormula, signed } from "../module/helpers/dice.mjs";

describe("normalizeDiceFormula", () => {
  test("lowercases and trims", () => {
    expect(normalizeDiceFormula(" 2D6 ")).toBe("2d6");
    expect(normalizeDiceFormula("3D6+2")).toBe("3d6+2");
  });

  test("handles null/undefined", () => {
    expect(normalizeDiceFormula(null)).toBe("");
    expect(normalizeDiceFormula(undefined)).toBe("");
  });
});

describe("isDiceFormula", () => {
  test("accepts dice strings in either case", () => {
    expect(isDiceFormula("2d6")).toBe(true);
    expect(isDiceFormula("2D6")).toBe(true);
    expect(isDiceFormula("1d6*10")).toBe(true);
    expect(isDiceFormula("4d6+1")).toBe(true);
  });

  test("rejects descriptive damage text", () => {
    expect(isDiceFormula("By grenade")).toBe(false);
    expect(isDiceFormula("")).toBe(false);
    expect(isDiceFormula(null)).toBe(false);
    expect(isDiceFormula("d6")).toBe(false);   // needs a leading dice count
  });
});

describe("signed", () => {
  test("formats DMs with an explicit sign", () => {
    expect(signed(2)).toBe("+2");
    expect(signed(0)).toBe("+0");
    expect(signed(-3)).toBe("-3");
  });
});
