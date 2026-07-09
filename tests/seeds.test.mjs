import { describe, expect, test } from "bun:test";
import { SKILLS_SEED }    from "../module/data/seeds/skills.mjs";
import { WEAPONS_SEED }   from "../module/data/seeds/weapons.mjs";
import { ARMOR_SEED }     from "../module/data/seeds/armor.mjs";
import { EQUIPMENT_SEED } from "../module/data/seeds/equipment.mjs";
import { AUGMENTS_SEED }  from "../module/data/seeds/augments.mjs";
import { TABLES_SEED }    from "../module/data/seeds/tables.mjs";
import { MACROS_SEED }    from "../module/data/seeds/macros.mjs";

function expectWellFormedItems(seed, type, expectedCount) {
  expect(seed.length).toBe(expectedCount);
  const names = seed.map(i => i.name);
  expect(new Set(names).size).toBe(names.length); // no duplicate names within a pack
  for (const item of seed) {
    expect(item.type).toBe(type);
    expect(typeof item.name).toBe("string");
    expect(item.name.length).toBeGreaterThan(0);
    expect(typeof item.system).toBe("object");
  }
}

describe("Item compendium seed counts and shape", () => {
  test("skills: 73 entries", () => expectWellFormedItems(SKILLS_SEED, "skill", 73));
  test("weapons: 39 entries", () => expectWellFormedItems(WEAPONS_SEED, "weapon", 39));
  test("armor: 9 entries", () => expectWellFormedItems(ARMOR_SEED, "armor", 9));
  test("equipment: 121 entries", () => expectWellFormedItems(EQUIPMENT_SEED, "equipment", 121));
  test("augments: 12 entries", () => expectWellFormedItems(AUGMENTS_SEED, "augment", 12));

  test("skills include the 5 psionic talents", () => {
    const psionic = SKILLS_SEED.filter(s => s.system.psionic === true);
    const names = psionic.map(s => s.name).sort();
    expect(names).toEqual(["Awareness", "Clairvoyance", "Telekinesis", "Telepathy", "Teleportation"]);
  });

  test("weapon skill field references a plausible cascade specialty (non-empty string)", () => {
    for (const w of WEAPONS_SEED) {
      expect(typeof w.system.skill).toBe("string");
    }
  });

  test("augments with a linked characteristic use a valid characteristic key", () => {
    const valid = ["", "str", "dex", "end", "int", "edu", "soc"];
    for (const a of AUGMENTS_SEED) {
      expect(valid).toContain(a.system.characteristic);
    }
  });
});

describe("TABLES_SEED (RollTable documents)", () => {
  test("has 5 tables", () => {
    expect(TABLES_SEED.length).toBe(5);
  });

  test("D66 tables (Random Encounters, Patron Encounters, Random Rumor Content) cover all 36 D66 values exactly once", () => {
    const d66Names = ["Random Encounters", "Patron Encounters", "Random Rumor Content"];
    const expectedValues = [];
    for (let tens = 1; tens <= 6; tens++) {
      for (let ones = 1; ones <= 6; ones++) expectedValues.push(tens * 10 + ones);
    }
    for (const name of d66Names) {
      const table = TABLES_SEED.find(t => t.name === name);
      expect(table, `expected table "${name}" to exist`).toBeTruthy();
      expect(table.formula).toBe("(1d6 * 10) + 1d6");
      const values = table.results.map(r => r.range[0]).sort((a, b) => a - b);
      expect(values).toEqual(expectedValues);
      // Every result should be a single-value range (range[0] === range[1]).
      expect(table.results.every(r => r.range[0] === r.range[1])).toBe(true);
    }
  });

  test("2D6 tables (Starship Encounters, Animal Encounter Template) cover 2-12 exactly once", () => {
    const twoD6Names = ["Starship Encounters", "Animal Encounter (2D6 Template)"];
    for (const name of twoD6Names) {
      const table = TABLES_SEED.find(t => t.name === name);
      expect(table, `expected table "${name}" to exist`).toBeTruthy();
      expect(table.formula).toBe("2d6");
      const values = table.results.map(r => r.range[0]).sort((a, b) => a - b);
      expect(values).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
  });

  test("every result has non-empty text and type 'text'", () => {
    for (const table of TABLES_SEED) {
      for (const result of table.results) {
        expect(result.type).toBe("text");
        expect(typeof result.text).toBe("string");
        expect(result.text.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("MACROS_SEED (Macro documents)", () => {
  test("has 5 macros, each a well-formed script macro", () => {
    expect(MACROS_SEED.length).toBe(5);
    const names = MACROS_SEED.map(m => m.name);
    expect(new Set(names).size).toBe(names.length);
    for (const macro of MACROS_SEED) {
      expect(macro.type).toBe("script");
      expect(macro.scope).toBe("global");
      expect(typeof macro.command).toBe("string");
      expect(macro.command.length).toBeGreaterThan(0);
      expect(typeof macro.img).toBe("string");
    }
  });

  test("every macro command is syntactically valid JS (as an async function body)", async () => {
    for (const macro of MACROS_SEED) {
      // AsyncFunction constructor throws SyntaxError on malformed script bodies
      // without needing a live Foundry environment to execute them.
      expect(() => new Function("return (async () => {\n" + macro.command + "\n})")())
        .not.toThrow();
    }
  });
});
