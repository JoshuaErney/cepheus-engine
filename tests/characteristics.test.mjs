import { describe, expect, test } from "bun:test";
import { computeCharacteristicDerived, computeWoundState } from "../module/helpers/characteristics.mjs";

function char(max, damage = 0) {
  return { max, damage };
}

describe("computeCharacteristicDerived", () => {
  test("undamaged average characteristic (7) has DM 0", () => {
    const chars = { str: char(7) };
    computeCharacteristicDerived(chars);
    expect(chars.str.current).toBe(7);
    expect(chars.str.value).toBe(7);
    expect(chars.str.dm).toBe(0);
    expect(chars.str.isDamaged).toBe(false);
    expect(chars.str.isDown).toBe(false);
  });

  test("fully damaged characteristic bottoms out at 0 with DM -3", () => {
    const chars = { str: char(7, 7) };
    computeCharacteristicDerived(chars);
    expect(chars.str.current).toBe(0);
    expect(chars.str.dm).toBe(-3);
    expect(chars.str.isDamaged).toBe(true);
    expect(chars.str.isDown).toBe(true);
  });

  test("damage never drives current below 0 even if it exceeds max", () => {
    const chars = { str: char(7, 99) };
    computeCharacteristicDerived(chars);
    expect(chars.str.current).toBe(0);
  });

  test("max characteristic (12) has DM +2", () => {
    const chars = { str: char(12) };
    computeCharacteristicDerived(chars);
    expect(chars.str.dm).toBe(2);
  });
});

describe("computeWoundState", () => {
  test("healthy: no damage", () => {
    const chars = { str: char(7), dex: char(7), end: char(7) };
    computeCharacteristicDerived(chars);
    expect(computeWoundState(chars)).toEqual({ woundState: "healthy", woundPenalty: 0 });
  });

  test("lightly wounded: any damage but nothing at 0", () => {
    const chars = { str: char(7, 2), dex: char(7), end: char(7) };
    computeCharacteristicDerived(chars);
    expect(computeWoundState(chars)).toEqual({ woundState: "lightly", woundPenalty: -1 });
  });

  test("seriously wounded: exactly one physical characteristic at 0", () => {
    const chars = { str: char(7, 7), dex: char(7), end: char(7) };
    computeCharacteristicDerived(chars);
    expect(computeWoundState(chars)).toEqual({ woundState: "seriously", woundPenalty: -2 });
  });

  test("mortally wounded: two physical characteristics at 0 (END still up)", () => {
    const chars = { str: char(7, 7), dex: char(7, 7), end: char(7) };
    computeCharacteristicDerived(chars);
    expect(computeWoundState(chars)).toEqual({ woundState: "mortally", woundPenalty: -2 });
  });

  test("dead: two down including END", () => {
    const chars = { str: char(7, 7), dex: char(7), end: char(7, 7) };
    computeCharacteristicDerived(chars);
    expect(computeWoundState(chars).woundState).toBe("dead");
  });

  test("dead: three physical characteristics at 0", () => {
    const chars = { str: char(7, 7), dex: char(7, 7), end: char(7, 7) };
    computeCharacteristicDerived(chars);
    expect(computeWoundState(chars).woundState).toBe("dead");
  });
});
