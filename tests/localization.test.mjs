import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(import.meta.dir, "..");

function walk(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      walk(full, exts, out);
    } else if (exts.includes(extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

function flattenKeys(obj, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flattenKeys(value, path, out);
    else out[path] = value;
  }
  return out;
}

// Every literal (non-interpolated) `CEPHEUS.X` key referenced via
// `{{localize "CEPHEUS.X"}}` (Handlebars) or `game.i18n.localize("CEPHEUS.X")`
// (JS) across the codebase. Dynamic keys built with template literals
// (e.g. `CEPHEUS.Tab${id}`) can't be statically resolved and are skipped —
// see PROJECT_STATUS.md for how those were hand-verified instead.
function findReferencedKeys() {
  const files = [
    ...walk(join(ROOT, "templates"), [".hbs"]),
    ...walk(join(ROOT, "module"), [".mjs"]),
  ];
  const pattern = /localize\(?\s*["'](CEPHEUS\.[A-Za-z0-9]+)["']/g;
  const keys = new Set();
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) keys.add(match[1]);
  }
  return keys;
}

describe("Localization completeness (lang/en.json)", () => {
  const lang = JSON.parse(readFileSync(join(ROOT, "lang/en.json"), "utf8"));
  const definedKeys = flattenKeys(lang);

  test("lang/en.json parses as valid JSON with TYPES and CEPHEUS roots", () => {
    expect(lang.TYPES).toBeTruthy();
    expect(lang.CEPHEUS).toBeTruthy();
  });

  test("every statically-referenced CEPHEUS.* localize key exists in lang/en.json", () => {
    const referenced = findReferencedKeys();
    const missing = [...referenced].filter(key => !(key in definedKeys));
    expect(missing).toEqual([]);
  });

  test("every Actor/Item type declared in system.json has a TYPES label", () => {
    const system = JSON.parse(readFileSync(join(ROOT, "system.json"), "utf8"));
    for (const [docType, types] of Object.entries(system.documentTypes)) {
      for (const type of Object.keys(types)) {
        expect(lang.TYPES[docType]?.[type], `TYPES.${docType}.${type}`).toBeTruthy();
      }
    }
  });
});
