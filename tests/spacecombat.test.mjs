import { describe, expect, test } from "bun:test";
import { damageToHits, applyTieredHit, missileToHitTarget } from "../module/helpers/spacecombat.mjs";

describe("damageToHits (SRD Table: Space Combat Damage, p.159)", () => {
  test("zero or negative damage does nothing", () => {
    expect(damageToHits(0)).toEqual({ single: 0, double: 0, triple: 0 });
    expect(damageToHits(-5)).toEqual({ single: 0, double: 0, triple: 0 });
  });

  test.each([
    [1, { single: 1, double: 0, triple: 0 }],
    [4, { single: 1, double: 0, triple: 0 }],
    [5, { single: 2, double: 0, triple: 0 }],
    [8, { single: 2, double: 0, triple: 0 }],
    [9, { single: 0, double: 1, triple: 0 }],
    [12, { single: 0, double: 1, triple: 0 }],
    [13, { single: 3, double: 0, triple: 0 }],
    [16, { single: 3, double: 0, triple: 0 }],
    [17, { single: 2, double: 1, triple: 0 }],
    [20, { single: 2, double: 1, triple: 0 }],
    [21, { single: 0, double: 2, triple: 0 }],
    [24, { single: 0, double: 2, triple: 0 }],
    [25, { single: 0, double: 0, triple: 1 }],
    [28, { single: 0, double: 0, triple: 1 }],
    [29, { single: 1, double: 0, triple: 1 }],
    [32, { single: 1, double: 0, triple: 1 }],
    [33, { single: 0, double: 1, triple: 1 }],
    [36, { single: 0, double: 1, triple: 1 }],
    [37, { single: 1, double: 1, triple: 1 }],
    [40, { single: 1, double: 1, triple: 1 }],
    [41, { single: 0, double: 0, triple: 2 }],
    [44, { single: 0, double: 0, triple: 2 }],
  ])("damage %i", (damage, expected) => {
    expect(damageToHits(damage)).toEqual(expected);
  });

  test("beyond 44 extrapolates via the extra-3/extra-6 rule", () => {
    // extra = 3 -> +1 single; extra = 6 -> +1 single, +1 double
    expect(damageToHits(47)).toEqual({ single: 1, double: 0, triple: 2 });
    expect(damageToHits(50)).toEqual({ single: 2, double: 1, triple: 2 });
  });
});

describe("applyTieredHit (0-3 subsystem/turret/bay damage tracks)", () => {
  test("applies within range with no overflow", () => {
    expect(applyTieredHit(0, 1)).toEqual({ value: 1, overflow: 0 });
    expect(applyTieredHit(1, 2)).toEqual({ value: 3, overflow: 0 });
  });

  test("caps at max and reports overflow", () => {
    expect(applyTieredHit(2, 2)).toEqual({ value: 3, overflow: 1 });
    expect(applyTieredHit(3, 1)).toEqual({ value: 3, overflow: 1 });
    expect(applyTieredHit(0, 5)).toEqual({ value: 3, overflow: 2 });
  });

  test("respects a custom max", () => {
    expect(applyTieredHit(0, 2, 1)).toEqual({ value: 1, overflow: 1 });
  });
});

describe("missileToHitTarget (SRD Table: Missile To-Hit By Skill Check Effect, p.156)", () => {
  test.each([
    [-9, 11],
    [-6, 11],
    [-5, 10],
    [-1, 10],
    [0, 8],
    [1, 7],
    [5, 7],
    [6, 6],
    [9, 6],
  ])("effect %i -> target %i+", (effect, expected) => {
    expect(missileToHitTarget(effect)).toBe(expected);
  });
});
