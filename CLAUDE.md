# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Foundry VTT v14 game system** implementing the **Cepheus Engine SRD** — an open-source sci-fi RPG based on Classic Traveller. Written in plain JavaScript (ES modules, `.mjs` files, no build step), targeting **Foundry VTT v14**.

## Development Workflow

**Install for live testing** — symlink this directory into Foundry's systems folder:
```bash
ln -s /Users/joshuaerney/Desktop/CepheusEngineSRD \
  ~/Library/Application\ Support/FoundryVTT/Data/systems/cepheus-engine
```
Adjust the Foundry Data path if yours differs. The system `id` in `system.json` must match the folder name (`cepheus-engine`).

**Reload after changes:** Press `F5` in the Foundry browser window. No build step needed.

**Debug hooks:** In the browser console: `CONFIG.debug.hooks = true`

**Inspect data:** All globals are available in console — `game`, `CONFIG`, `Hooks`, `Actor`, `Item`, `foundry`, etc.

## File Structure

```
system.json           # Manifest: id, esmodules, documentTypes, packs, languages, compatibility
cepheus.mjs           # Main entry point (listed in system.json esmodules[])
module/
  config/
    config.mjs        # CONFIG.CEPHEUS constants (characteristics, skills, difficulties, etc.)
  data/
    actor-data.mjs    # TypeDataModel subclasses for each actor type
    item-data.mjs     # TypeDataModel subclasses for each item type
  documents/
    actor.mjs         # CepheusActor extends Actor
    item.mjs          # CepheusItem extends Item
  sheets/
    actor-sheet.mjs   # CepheusActorSheet (ActorSheetV2 + HandlebarsApplicationMixin)
    item-sheet.mjs    # CepheusItemSheet (ItemSheetV2 + HandlebarsApplicationMixin)
  helpers/
    dice.mjs          # 2D6 roll resolution helpers
    handlebars.mjs    # Custom Handlebars helpers registration
templates/
  actor/              # .hbs templates for actor sheet PARTS
  item/               # .hbs templates for item sheet PARTS
styles/
  cepheus.css
lang/
  en.json             # All user-facing strings; keys under CEPHEUS.* and TYPES.*
packs/                # Compendium pack source files
```

## Foundry VTT v14 Architecture

### system.json key fields

```json
{
  "id": "cepheus-engine",
  "title": "Cepheus Engine SRD",
  "version": "1.0.0",
  "compatibility": { "minimum": "14", "verified": "14" },
  "esmodules": ["cepheus.mjs"],
  "styles": ["styles/cepheus.css"],
  "languages": [{ "lang": "en", "name": "English", "path": "lang/en.json" }],
  "documentTypes": {
    "Actor": { "character": {}, "npc": {}, "creature": {}, "ship": {} },
    "Item":  { "skill": {}, "weapon": {}, "armor": {}, "equipment": {}, "augment": {}, "shipComponent": {} }
  },
  "initiative": "2d6",
  "primaryTokenAttribute": "characteristics.end",
  "packs": []
}
```

### Entry point (`cepheus.mjs`)

Everything registers in `Hooks.once("init", ...)`:

```javascript
import { CepheusActor } from "./module/documents/actor.mjs";
import { CepheusItem }  from "./module/documents/item.mjs";
import { CepheusActorSheet } from "./module/sheets/actor-sheet.mjs";
import { CepheusItemSheet }  from "./module/sheets/item-sheet.mjs";
import { CharacterData, NpcData, ShipData } from "./module/data/actor-data.mjs";
// ... etc

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = CepheusActor;
  CONFIG.Item.documentClass  = CepheusItem;

  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterData,
    npc: NpcData,
    creature: CreatureData,
    ship: ShipData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    skill: SkillData,
    weapon: WeaponData,
    // ...
  });

  const { Actors, Items } = foundry.documents.collections;   // v14 namespacing
  const { ActorSheet, ItemSheet } = foundry.appv1.sheets;    // v14 namespacing

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cepheus-engine", CepheusActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cepheus-engine", CepheusItemSheet, { makeDefault: true });
});
```

### Data Models (v14 — `TypeDataModel`)

Define data schemas here, not in `template.json` (legacy). Use `foundry.abstract.TypeDataModel`:

```javascript
const { fields } = foundry.data;

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristics: new fields.SchemaField({
        str: new fields.SchemaField({
          value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 7 }),
        }),
        // dex, end, int, edu, soc ...
      }),
      credits: new fields.NumberField({ required: true, initial: 0, min: 0 }),
      // ...
    };
  }

  prepareDerivedData() {
    // Compute DMs, UPP string, etc.
    for (const [key, char] of Object.entries(this.characteristics)) {
      char.dm = Math.floor((char.value - 7) / 2);  // Cepheus DM table
    }
  }
}
```

`prepareBaseData()` runs before Active Effects; `prepareDerivedData()` runs after. Override both in TypeDataModel subclasses, not on the Actor/Item document directly (unless cross-type logic is needed).

### Sheets (v14 — `ActorSheetV2` + `HandlebarsApplicationMixin`)

The old `ActorSheet` / `ItemSheet` (Application v1) still works in v14 but is deprecated. Use the v2 framework:

```javascript
const { ActorSheetV2, HandlebarsApplicationMixin } = foundry.applications.sheets;

export class CepheusActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor"],
    position: { width: 720, height: 600 },
    window: { resizable: true },
    actions: {
      rollSkill: CepheusActorSheet.#onRollSkill,
    },
  };

  static PARTS = {
    header: { template: "systems/cepheus-engine/templates/actor/header.hbs" },
    tabs:   { template: "templates/generic/tab-navigation.hbs" },
    skills: { template: "systems/cepheus-engine/templates/actor/skills.hbs" },
    // one entry per tab/section
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      characteristics: this.actor.system.characteristics,
      skills: this.actor.itemTypes.skill,
    };
  }

  // Actions are static private methods
  static async #onRollSkill(event, target) {
    const skillId = target.dataset.skillId;
    // ...
  }
}
```

- **`_prepareContext()`** replaces `getData()`.
- **`_onRender()`** replaces `activateListeners()` for post-render DOM work.
- **`PARTS`** replaces a single template path — each part renders independently (enables partial re-renders).
- **`actions`** in `DEFAULT_OPTIONS` map data-action attribute values to static handler methods.

### Document Classes

Only put logic here that genuinely needs to live on the document (e.g., roll methods called from macros, cross-type derived data):

```javascript
export class CepheusActor extends Actor {
  async rollCharacteristic(characteristicKey) { /* ... */ }
  async rollSkill(skillId, options = {}) { /* 2D6 + DM + skill level vs difficulty */ }
}
```

### Removed in v14

- **Measured Templates** are removed. Use **Regions** for AoE effects and template-like behaviors.

## Cepheus Engine SRD Rules Reference

**Core mechanic:** 2D6 + skill level + characteristic DM ≥ difficulty target number.

| Difficulty    | Target |
|---------------|--------|
| Easy          | 4+     |
| Routine       | 6+     |
| Average       | 8+     |
| Difficult     | 10+    |
| Very Difficult| 12+    |
| Formidable    | 14+    |

**Characteristics (UPP — 6 values):** STR, DEX, END, INT, EDU, SOC. Each 2–12. DM = `Math.floor((value - 7) / 2)` clamped to the standard table (value 2→DM-2, 3-5→DM-1, 6-8→DM+0, 9-11→DM+1, 12→DM+2).

**Actor types:** `character`, `npc`, `creature`, `ship`

**Item types:** `skill`, `weapon`, `armor`, `equipment`, `augment`, `shipComponent`

**Combat:** Initiative (2D6 + DEX DM) → attack (2D6 + skill + STR or DEX DM vs 8+) → damage (weapon dice − armor value) → apply to characteristics. Wound states: Lightly Wounded → Seriously Wounded (one characteristic = 0) → Mortally Wounded (two = 0) → Dead (three = 0, or END hits 0 after serious).

**Spacecraft:** Stats are tonnage-based. Jump drives consume 10% hull tonnage × Jump number in fuel per jump. Travel time: 1 week per jump number. Track hull points, armor, power plant output, and maneuver/jump drive ratings.

**Character generation:** Lifepath — choose career, roll for survival/advancement per term (4 years), gain skills and benefits, aging effects after term 4. Model as a multi-step dialog using `DialogV2` or a dedicated ApplicationV2 app.

## Conventions

- System template paths: always `systems/cepheus-engine/templates/...` (not relative paths).
- Localization keys: `CEPHEUS.CharStr`, `CEPHEUS.SkillPilot`, etc. Actor/Item type names go under `TYPES.Actor.character`, `TYPES.Item.skill`, etc. (Foundry v14 uses these automatically in the UI).
- Prefix all CSS classes with `cepheus-`.
- Use `foundry.utils.mergeObject()` and `foundry.utils.deepClone()` — avoid jQuery for new code.
- Keep roll logic in Actor document methods so macros can call them: `actor.rollSkill(...)`.
