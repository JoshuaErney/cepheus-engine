import { preventEnterSubmit } from "../helpers/form.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "item"],
    position: { width: 520, height: 480 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      rollAttack: CepheusItemSheet.#onRollAttack,
      rollDamage: CepheusItemSheet.#onRollDamage,
    },
  };

  static PARTS = {
    header: { template: "systems/cepheus-engine/templates/item/header.hbs" },
    body:   { template: "systems/cepheus-engine/templates/item/body.hbs", scrollable: [""] },
  };

  async _onRender(context, options) {
    await super._onRender(context, options);
    preventEnterSubmit(this.element);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      system:      this.item.system,
      itemType:    this.item.type,
      charOptions: CONFIG.CEPHEUS.characteristics,
      weaponTypeOptions:  CONFIG.CEPHEUS.spaceCombat.weaponTypes,
      mountOptions:       CONFIG.CEPHEUS.spaceCombat.mounts,
      missileTypeOptions: CONFIG.CEPHEUS.spaceCombat.missileTypes,
      screenTypeOptions:  CONFIG.CEPHEUS.spaceCombat.screenTypes,
      showAmmo:    ["missile", "sandcaster"].includes(this.item.system.weaponType),
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
