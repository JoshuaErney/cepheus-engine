import { CepheusBaseActorSheet } from "./base-actor-sheet.mjs";

export class CepheusCreatureSheet extends CepheusBaseActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "creature"],
    position: { width: 520, height: 500 },
    actions: {
      rollAttack: CepheusCreatureSheet.#onRollAttack,
    },
  };

  static PARTS = {
    header: {
      template: "systems/cepheus-engine/templates/actor/creature/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    stats: {
      template: "systems/cepheus-engine/templates/actor/creature/stats.hbs",
      scrollable: [""],
    },
    notes: {
      template: "systems/cepheus-engine/templates/actor/creature/notes.hbs",
      scrollable: [""],
    },
  };

  static TABS = ["stats", "notes"];

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      behaviorOptions: CONFIG.CEPHEUS.behaviorTypes,
      charConfig:      CONFIG.CEPHEUS.characteristics,
    };
  }

  static async #onRollAttack(event, target) {
    await this.actor.rollCreatureAttack();
  }
}
