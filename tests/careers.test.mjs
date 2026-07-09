import { describe, expect, test } from "bun:test";
import { CAREERS } from "../module/data/careers.mjs";

const CHAR_KEYS = ["str", "dex", "end", "int", "edu", "soc"];
const SKILL_TABLES = ["personal", "service", "specialist", "advanced"];

describe("CAREERS data", () => {
  test("has exactly 24 careers (SRD pp.33-40)", () => {
    expect(CAREERS.length).toBe(24);
  });

  test("every career has a unique id", () => {
    const ids = CAREERS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(CAREERS.map(c => [c.id, c]))("%s has a well-formed shape", (id, career) => {
    expect(typeof career.name).toBe("string");
    expect(career.name.length).toBeGreaterThan(0);
    expect(typeof career.description).toBe("string");
    expect(career.description.length).toBeGreaterThan(0);

    expect(CHAR_KEYS).toContain(career.qualification.char);
    expect(career.qualification.target).toBeGreaterThanOrEqual(2);
    expect(CHAR_KEYS).toContain(career.survival.char);

    // Commission/advancement are null only for the 7 no-rank careers.
    if (career.commission !== null) {
      expect(CHAR_KEYS).toContain(career.commission.char);
    }
    if (career.advancement !== null) {
      expect(CHAR_KEYS).toContain(career.advancement.char);
    }

    expect(career.reenlistment).toBeGreaterThanOrEqual(2);
    expect(career.reenlistment).toBeLessThanOrEqual(12);

    // rankTitles is always 7 entries, even as a repeated placeholder for
    // no-commission careers (see the comment block at the top of careers.mjs).
    expect(career.rankTitles).toHaveLength(7);

    for (const table of SKILL_TABLES) {
      expect(Array.isArray(career.skills[table])).toBe(true);
      expect(career.skills[table].length).toBeGreaterThan(0);
    }

    expect(career.cash).toHaveLength(6);
    // Some careers' first cash-table row is legitimately Cr0 per the SRD
    // (e.g. Barbarian, Drifter) — only require non-negative numbers.
    expect(career.cash.every(n => typeof n === "number" && n >= 0)).toBe(true);
    expect(career.benefits).toHaveLength(6);
    expect(career.benefits.every(b => typeof b === "string" && b.length > 0)).toBe(true);
  });

  test("no-commission careers (SRD p.29) have null commission/advancement", () => {
    const noCommission = ["athlete", "barbarian", "belter", "drifter", "entertainer", "hunter", "scout"];
    for (const id of noCommission) {
      const career = CAREERS.find(c => c.id === id);
      expect(career, `expected career "${id}" to exist`).toBeTruthy();
      expect(career.commission).toBeNull();
      expect(career.advancement).toBeNull();
    }
  });
});
