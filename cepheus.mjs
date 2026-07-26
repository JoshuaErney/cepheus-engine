import { CEPHEUS } from "./module/config/config.mjs";
import { CepheusActor } from "./module/documents/actor.mjs";
import { CepheusItem } from "./module/documents/item.mjs";
import { CepheusCombatant } from "./module/documents/combatant.mjs";
import { CepheusActorSheet }    from "./module/sheets/actor-sheet.mjs";
import { CepheusNpcSheet }      from "./module/sheets/npc-sheet.mjs";
import { CepheusCreatureSheet } from "./module/sheets/creature-sheet.mjs";
import { CepheusShipSheet }    from "./module/sheets/ship-sheet.mjs";
import { CepheusItemSheet }    from "./module/sheets/item-sheet.mjs";
import { CharacterData, NpcData, CreatureData, ShipData } from "./module/data/actor-data.mjs";
import {
  SkillData, WeaponData, ArmorData,
  EquipmentData, AugmentData, ShipComponentData,
} from "./module/data/item-data.mjs";
import { registerHandlebarsHelpers } from "./module/helpers/handlebars.mjs";
import { rollCheck } from "./module/helpers/dice.mjs";
import { promptForm, promptNumber, promptSelect } from "./module/helpers/dialogs.mjs";
import { SKILLS_SEED }  from "./module/data/seeds/skills.mjs";
import { WEAPONS_SEED } from "./module/data/seeds/weapons.mjs";
import { ARMOR_SEED }      from "./module/data/seeds/armor.mjs";
import { EQUIPMENT_SEED }  from "./module/data/seeds/equipment.mjs";
import { AUGMENTS_SEED }   from "./module/data/seeds/augments.mjs";
import { TABLES_SEED }     from "./module/data/seeds/tables.mjs";
import { MACROS_SEED }     from "./module/data/seeds/macros.mjs";

Hooks.once("init", () => {
  console.log("Cepheus Engine SRD | Initialising");

  CONFIG.CEPHEUS = CEPHEUS;

  CONFIG.Combat.initiative = {
    formula:  "2d6 + @characteristics.dex.dm",
    decimals: 0,
  };

  CONFIG.Actor.documentClass     = CepheusActor;
  CONFIG.Item.documentClass      = CepheusItem;
  // Ships roll flat 2d6 initiative instead of the dex-based formula above.
  CONFIG.Combatant.documentClass = CepheusCombatant;

  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterData,
    npc:       NpcData,
    creature:  CreatureData,
    ship:      ShipData,
  });

  Object.assign(CONFIG.Item.dataModels, {
    skill:         SkillData,
    weapon:        WeaponData,
    armor:         ArmorData,
    equipment:     EquipmentData,
    augment:       AugmentData,
    shipComponent: ShipComponentData,
  });

  const { Actors, Items } = foundry.documents.collections;
  const { ActorSheet, ItemSheet } = foundry.appv1.sheets;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cepheus-engine", CepheusActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "CEPHEUS.SheetClassActor",
  });
  Actors.registerSheet("cepheus-engine", CepheusNpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "CEPHEUS.SheetClassNpc",
  });
  Actors.registerSheet("cepheus-engine", CepheusCreatureSheet, {
    types: ["creature"],
    makeDefault: true,
    label: "CEPHEUS.SheetClassCreature",
  });
  Actors.registerSheet("cepheus-engine", CepheusShipSheet, {
    types: ["ship"],
    makeDefault: true,
    label: "CEPHEUS.SheetClassShip",
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cepheus-engine", CepheusItemSheet, {
    makeDefault: true,
    label: "CEPHEUS.SheetClassItem",
  });

  registerHandlebarsHelpers();

  // Macro-facing API: compendium macros can't import module files, so the
  // shared check/dialog helpers are exposed here instead of being re-rolled
  // inline in each macro.
  game.cepheus = { rollCheck, promptForm, promptNumber, promptSelect };
});

Hooks.once("ready", async () => {
  console.log("Cepheus Engine SRD | Ready");
  if (game.user.isGM) await syncCompendiums();
});

const PACK_SEEDS = [
  ["cepheus-engine.skills",    SKILLS_SEED],
  ["cepheus-engine.weapons",   WEAPONS_SEED],
  ["cepheus-engine.armor",     ARMOR_SEED],
  ["cepheus-engine.equipment", EQUIPMENT_SEED],
  ["cepheus-engine.augments",  AUGMENTS_SEED],
  ["cepheus-engine.tables",    TABLES_SEED],
  ["cepheus-engine.macros",    MACROS_SEED],
];

async function syncCompendiums() {
  for (const [collection, seed] of PACK_SEEDS) {
    await syncPack(collection, seed);
  }
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
