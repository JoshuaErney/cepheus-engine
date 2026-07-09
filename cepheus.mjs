import { CEPHEUS } from "./module/config/config.mjs";
import { CepheusActor } from "./module/documents/actor.mjs";
import { CepheusItem } from "./module/documents/item.mjs";
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

  CONFIG.Actor.documentClass = CepheusActor;
  CONFIG.Item.documentClass  = CepheusItem;

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
});

Hooks.once("ready", async () => {
  console.log("Cepheus Engine SRD | Ready");
  if (game.user.isGM) {
    await seedCompendiums();
    await patchSkillsPack();
  }
});

async function seedCompendiums() {
  await seedPack("cepheus-engine.skills",    SKILLS_SEED);
  await seedPack("cepheus-engine.weapons",   WEAPONS_SEED);
  await seedPack("cepheus-engine.armor",     ARMOR_SEED);
  await seedPack("cepheus-engine.equipment", EQUIPMENT_SEED);
  await seedPack("cepheus-engine.augments",  AUGMENTS_SEED);
  await seedPack("cepheus-engine.tables",    TABLES_SEED);
  await seedPack("cepheus-engine.macros",    MACROS_SEED);
}

// Add any skills in SKILLS_SEED that are not yet in the compendium.
async function patchSkillsPack() {
  const pack = game.packs.get("cepheus-engine.skills");
  if (!pack) return;
  const docs = await pack.getDocuments();
  const existing = new Set(docs.map(d => d.name));
  const missing  = SKILLS_SEED.filter(s => !existing.has(s.name));
  if (!missing.length) return;
  console.log(`Cepheus Engine SRD | Patching skills pack — adding ${missing.length} new entries`);
  await pack.configure({ locked: false });
  try {
    await pack.documentClass.createDocuments(missing, { pack: "cepheus-engine.skills" });
  } finally {
    await pack.configure({ locked: true });
  }
}

async function seedPack(collection, seedData) {
  const pack = game.packs.get(collection);
  if (!pack) {
    console.warn(`Cepheus Engine SRD | Pack not found: ${collection}`);
    return;
  }
  await pack.getDocuments();
  if (pack.size > 0) return;

  console.log(`Cepheus Engine SRD | Seeding ${collection} with ${seedData.length} entries`);
  await pack.configure({ locked: false });
  try {
    await pack.documentClass.createDocuments(seedData, { pack: collection, keepId: false });
    console.log(`Cepheus Engine SRD | ${collection} seeded`);
  } finally {
    await pack.configure({ locked: true });
  }
}
