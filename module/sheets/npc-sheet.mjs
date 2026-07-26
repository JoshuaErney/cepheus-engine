import { CepheusActorSheet } from "./actor-sheet.mjs";

export class CepheusNpcSheet extends CepheusActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "npc"],
    position: { width: 680, height: 580 },
  };

  // Reuse all character templates except swap biography → notes.
  static PARTS = {
    header: {
      template: "systems/cepheus-engine/templates/actor/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    characteristics: {
      template: "systems/cepheus-engine/templates/actor/characteristics.hbs",
      scrollable: [""],
    },
    skills: {
      template: "systems/cepheus-engine/templates/actor/skills.hbs",
      scrollable: [""],
    },
    equipment: {
      template: "systems/cepheus-engine/templates/actor/equipment.hbs",
      scrollable: [""],
    },
    notes: {
      template: "systems/cepheus-engine/templates/actor/npc/notes.hbs",
      scrollable: [""],
    },
  };

  static TABS = ["characteristics", "skills", "equipment", "notes"];
}
