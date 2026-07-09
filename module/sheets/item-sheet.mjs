const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "item"],
    position: { width: 520, height: 420 },
    window: { resizable: true },
    actions: {
      rollAttack: CepheusItemSheet.#onRollAttack,
      rollDamage: CepheusItemSheet.#onRollDamage,
    },
  };

  static PARTS = {
    header: { template: "systems/cepheus-engine/templates/item/header.hbs" },
    body:   { template: "systems/cepheus-engine/templates/item/body.hbs", scrollable: [""] },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      system:      this.item.system,
      itemType:    this.item.type,
      charOptions: CONFIG.CEPHEUS.characteristics,
      hasActor:    !!this.item.actor,
    };
  }

  static async #onRollAttack(event, target) {
    const actor = this.item.actor;
    if (!actor) return;
    await actor.rollAttack(this.item);
  }

  static async #onRollDamage(event, target) {
    const actor = this.item.actor;
    if (!actor) return;
    await actor.rollDamage(this.item);
  }
}
