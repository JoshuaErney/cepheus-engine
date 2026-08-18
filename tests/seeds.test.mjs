import { describe, expect, test } from "bun:test";
import { SKILLS_SEED }    from "../module/data/seeds/skills.mjs";
import { WEAPONS_SEED }   from "../module/data/seeds/weapons.mjs";
import { ARMOR_SEED }     from "../module/data/seeds/armor.mjs";
import { EQUIPMENT_SEED } from "../module/data/seeds/equipment.mjs";
import { AUGMENTS_SEED }  from "../module/data/seeds/augments.mjs";
import { TABLES_SEED }    from "../module/data/seeds/tables.mjs";
import { MACROS_SEED }    from "../module/data/seeds/macros.mjs";
import { FOLDER_SEED }    from "../module/data/seeds/folders.mjs";

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
  test("has 16 tables", () => {
    expect(TABLES_SEED.length).toBe(16);
  });

  test("table names are unique", () => {
    const names = TABLES_SEED.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
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

  test("1D6 sub-tables (Encounter Type + Animal Encounter 1D6 Template) cover 1-6 exactly once", () => {
    const oneD6Names = [
      "Alien Vessel Encounter Type", "Astrogation Encounter Type", "Derelict Encounter Type",
      "Hostile Vessel Encounter Type", "Merchant Vessel Encounter Type", "Military Vessel Encounter Type",
      "Personal Vessel Encounter Type", "Spacecraft Encounter Type", "Space Habitat Encounter Type",
      "Space Junk Encounter Type", "Animal Encounter (1D6 Template)",
    ];
    for (const name of oneD6Names) {
      const table = TABLES_SEED.find(t => t.name === name);
      expect(table, `expected table "${name}" to exist`).toBeTruthy();
      expect(table.formula).toBe("1d6");
      const values = table.results.map(r => r.range[0]).sort((a, b) => a - b);
      expect(values).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  // "document" is the current (Foundry v13+) TableResult type for a
  // reference to another document; the older "pack" value + the
  // documentCollection/documentId field pair are deprecated and (confirmed
  // against a live v14 session) silently dropped on write — see
  // seed-sync.mjs's resolveTableReferences(). Foundry's own RollTable#draw()
  // auto-resolves a "document"-type result pointing at another RollTable,
  // so no custom chaining code is needed on this system's side at all.
  test("every result is a well-formed 'text' or 'document' reference", () => {
    for (const table of TABLES_SEED) {
      for (const result of table.results) {
        expect(["text", "document"]).toContain(result.type);
        expect(typeof result.description).toBe("string");
        expect(result.description.length).toBeGreaterThan(0);
      }
    }
  });

  test("chained ('document') results reference a sub-table that actually exists in TABLES_SEED", () => {
    const names = new Set(TABLES_SEED.map(t => t.name));
    let chainedCount = 0;
    for (const table of TABLES_SEED) {
      for (const result of table.results) {
        if (result.type !== "document") continue;
        chainedCount++;
        const refName = result.flags?.["cepheus-engine"]?.subTableRef;
        expect(refName, `"document" result on ${table.name} is missing a subTableRef flag`).toBeTruthy();
        expect(names.has(refName), `${table.name}'s reference to "${refName}" has no matching table`).toBe(true);
        expect(result.documentUuid).toBeUndefined(); // patched at runtime by resolveTableReferences()
      }
    }
    // Starship Encounters chains 10 of its 11 results (all but "Referee's Choice").
    expect(chainedCount).toBe(10);
  });
});

describe("MACROS_SEED (Macro documents)", () => {
  test("has 6 macros, each a well-formed script macro", () => {
    expect(MACROS_SEED.length).toBe(6);
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

describe("FOLDER_SEED (default campaign folder structure)", () => {
  // Foundry document types that actually support a `folder` field/tree.
  const FOLDER_CAPABLE_TYPES = ["Actor", "Item", "JournalEntry", "Scene", "RollTable", "Macro", "Cards", "Playlist"];
  const HEX_COLOR = /^#[0-9a-f]{6}$/i;

  function walk(nodes, out = []) {
    for (const node of nodes) {
      out.push(node);
      if (node.children?.length) walk(node.children, out);
    }
    return out;
  }

  test("every key is a folder-capable Foundry document type", () => {
    for (const type of Object.keys(FOLDER_SEED)) {
      expect(FOLDER_CAPABLE_TYPES).toContain(type);
    }
  });

  test("every tree has at least one top-level folder", () => {
    for (const [type, tree] of Object.entries(FOLDER_SEED)) {
      expect(tree.length, `${type} should have at least one folder`).toBeGreaterThan(0);
    }
  });

  test("sibling folder names are unique at every level, and every node is well-formed", () => {
    for (const [type, tree] of Object.entries(FOLDER_SEED)) {
      const checkSiblings = nodes => {
        const names = nodes.map(n => n.name);
        expect(new Set(names).size, `duplicate sibling names in ${type}`).toBe(names.length);
        for (const node of nodes) {
          if (node.children?.length) checkSiblings(node.children);
        }
      };
      checkSiblings(tree);

      for (const node of walk(tree)) {
        expect(typeof node.name).toBe("string");
        expect(node.name.length).toBeGreaterThan(0);
        if (node.color !== undefined) expect(node.color).toMatch(HEX_COLOR);
        if (node.children !== undefined) expect(Array.isArray(node.children)).toBe(true);
      }
    }
  });
});
