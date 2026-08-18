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
import { syncCompendiums } from "./module/data/seed-sync.mjs";
import { registerFolderSeedSetting, seedCampaignFoldersOnce, ensureCampaignFolders } from "./module/data/folder-seed.mjs";

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
  registerFolderSeedSetting();

  // Macro-facing API: compendium macros can't import module files, so the
  // shared check/dialog helpers are exposed here instead of being re-rolled
  // inline in each macro.
  game.cepheus = {
    rollCheck, promptForm, promptNumber, promptSelect,
    createCampaignFolders: ensureCampaignFolders,
  };
});

Hooks.once("ready", async () => {
  console.log("Cepheus Engine SRD | Ready");
  if (game.user.isGM) {
    await syncCompendiums();
    // First-launch only; a GM can re-run this any time via the "Create
    // Campaign Folders" macro (game.cepheus.createCampaignFolders()).
    await seedCampaignFoldersOnce();
  }
});
