import { preventEnterSubmit } from "../helpers/form.mjs";
import { promptNumber } from "../helpers/dialogs.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

// Shared base for every Cepheus actor sheet. Owns the plumbing each sheet
// used to duplicate: tab construction from a static TABS list, per-part tab
// context, Enter-submit suppression, and the item-management / damage actions
// whose handlers are identical across actor types.
export class CepheusBaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor"],
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      createItem:   CepheusBaseActorSheet.#onCreateItem,
      editItem:     CepheusBaseActorSheet.#onEditItem,
      deleteItem:   CepheusBaseActorSheet.#onDeleteItem,
      applyDamage:  CepheusBaseActorSheet.#onApplyDamage,
      healDamage:   CepheusBaseActorSheet.#onHealDamage,
      fullRecovery: CepheusBaseActorSheet.#onFullRecovery,
    },
  };

  // Tab ids for _getTabs(), in display order; the first is the initial tab.
  // Each id must have a CEPHEUS.Tab<Id> label in lang/en.json.
  static TABS = [];

  tabGroups = { primary: this.constructor.TABS[0] };

  async _onRender(context, options) {
    await super._onRender(context, options);
    preventEnterSubmit(this.element);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.tabs   = this._getTabs();
    // Templates read actor data as {{system.x}} — including derived fields —
    // rather than sheets re-flattening each field into the context.
    context.system = this.actor.system;
    return context;
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs) context.tab = context.tabs[partId];
    return context;
  }

  _getTabs() {
    const group = "primary";
    return Object.fromEntries(
      this.constructor.TABS.map(id => [
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

  static async #onCreateItem(event, target) {
    const type = target.dataset.type ?? "skill";
    await Item.create({ name: game.i18n.localize(`TYPES.Item.${type}`), type }, { parent: this.actor });
  }

  static async #onEditItem(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    await item?.sheet.render({ force: true });
  }

  static async #onDeleteItem(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await item.delete();
  }

  static async #onApplyDamage(event, target) {
    const amount = await promptNumber({
      title: "CEPHEUS.ApplyDamage",
      label: "CEPHEUS.DamageAmount",
    });
    if (amount > 0) await this.actor.applyDamage(amount);
  }

  static async #onHealDamage(event, target) {
    const amount = await promptNumber({
      title:   "CEPHEUS.HealDamage",
      label:   "CEPHEUS.HealAmount",
      initial: 1,
      min:     1,
      okLabel: "CEPHEUS.Heal",
    });
    if (amount > 0) await this.actor.healDamage(amount);
  }

  static async #onFullRecovery(event, target) {
    await this.actor.fullRecovery();
  }
}
