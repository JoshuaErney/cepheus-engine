import { CepheusActorSheet } from "./actor-sheet.mjs";

export class CepheusNpcSheet extends CepheusActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "npc"],
    position: { width: 680, height: 580 },
    window: { resizable: true },
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

  tabGroups = { primary: "characteristics" };

  _getTabs() {
    const group = "primary";
    const tabIds = ["characteristics", "skills", "equipment", "notes"];
    return Object.fromEntries(
      tabIds.map(id => [
        id,
        {
          id,
          group,
          active:   this.tabGroups[group] === id,
          cssClass: this.tabGroups[group] === id ? "active" : "",
          label:    `CEPHEUS.Tab${id.charAt(0).toUpperCase() + id.slice(1)}`,
        },
      ])
    );
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.notes = this.actor.system.notes ?? "";
    return context;
  }
}
