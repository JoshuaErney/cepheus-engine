import { SKILLS_SEED }    from "./seeds/skills.mjs";
import { WEAPONS_SEED }   from "./seeds/weapons.mjs";
import { ARMOR_SEED }     from "./seeds/armor.mjs";
import { EQUIPMENT_SEED } from "./seeds/equipment.mjs";
import { AUGMENTS_SEED }  from "./seeds/augments.mjs";
import { TABLES_SEED }    from "./seeds/tables.mjs";
import { MACROS_SEED }    from "./seeds/macros.mjs";

const TABLES_PACK = "cepheus-engine.tables";

const PACK_SEEDS = [
  ["cepheus-engine.skills",    SKILLS_SEED],
  ["cepheus-engine.weapons",   WEAPONS_SEED],
  ["cepheus-engine.armor",     ARMOR_SEED],
  ["cepheus-engine.equipment", EQUIPMENT_SEED],
  ["cepheus-engine.augments",  AUGMENTS_SEED],
  [TABLES_PACK,                TABLES_SEED],
  ["cepheus-engine.macros",    MACROS_SEED],
];

export async function syncCompendiums() {
  for (const [collection, seed] of PACK_SEEDS) {
    await syncPack(collection, seed);
  }
  // Second pass: chained-table results (see tableResults() in seeds/tables.mjs)
  // reference a sibling table by name because its real document _id doesn't
  // exist until that table itself has been created — resolve those now that
  // every table in the pack does.
  await resolveTableReferences(TABLES_PACK);
}

// Create any seed entries (matched by name) missing from the pack. Covers
// both first-launch seeding (empty pack ⇒ everything is missing) and system
// updates that extend a seed file — new entries reach existing worlds too.
// Entries a GM has edited or renamed are left alone; only names absent from
// the pack are added.
async function syncPack(collection, seedData) {
  const pack = game.packs.get(collection);
  if (!pack) {
    console.warn(`Cepheus Engine SRD | Pack not found: ${collection}`);
    return;
  }
  const docs     = await pack.getDocuments();
  const existing = new Set(docs.map(d => d.name));
  const missing  = seedData.filter(e => !existing.has(e.name));
  if (!missing.length) return;

  console.log(`Cepheus Engine SRD | Syncing ${collection} — adding ${missing.length} entries`);
  await pack.configure({ locked: false });
  try {
    await pack.documentClass.createDocuments(missing, { pack: collection, keepId: false });
  } finally {
    await pack.configure({ locked: true });
  }
}

// Patches any RollTable result carrying a `subTableRef` flag (a name-based
// placeholder for "draw on this other table next") to the real document _id
// of the now-created sibling table. Idempotent — already-resolved results
// (documentId set) are skipped, so re-running on every `ready` is harmless.
async function resolveTableReferences(collection) {
  const pack = game.packs.get(collection);
  if (!pack) return;

  const tables = await pack.getDocuments();
  const byName = new Map(tables.map(t => [t.name, t]));
  const pending = [];

  for (const table of tables) {
    const updates = [];
    for (const result of table.results) {
      const refName = result.flags?.["cepheus-engine"]?.subTableRef;
      if (!refName || result.documentId) continue;
      const target = byName.get(refName);
      if (!target) {
        console.warn(`Cepheus Engine SRD | Table reference not found: "${refName}" (from ${table.name})`);
        continue;
      }
      updates.push({ _id: result._id, documentId: target.id });
    }
    if (updates.length) pending.push([table, updates]);
  }
  if (!pending.length) return;

  await pack.configure({ locked: false });
  try {
    for (const [table, updates] of pending) {
      await table.updateEmbeddedDocuments("TableResult", updates);
    }
  } finally {
    await pack.configure({ locked: true });
  }
}
