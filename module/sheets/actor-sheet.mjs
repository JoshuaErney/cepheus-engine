import { CepheusChargenApp } from "../apps/chargen.mjs";
import { preventEnterSubmit } from "../helpers/form.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor"],
    position: { width: 720, height: 620 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      startChargen:       CepheusActorSheet.#onStartChargen,
      rollCharacteristic: CepheusActorSheet.#onRollCharacteristic,
      rollSkill:          CepheusActorSheet.#onRollSkill,
      rollAttack:         CepheusActorSheet.#onRollAttack,
      rollDamage:         CepheusActorSheet.#onRollDamage,
      rollPsionic:        CepheusActorSheet.#onRollPsionic,
      testPsionics:       CepheusActorSheet.#onTestPsionics,
      recoverPsi:         CepheusActorSheet.#onRecoverPsi,
      createItem:         CepheusActorSheet.#onCreateItem,
      editItem:           CepheusActorSheet.#onEditItem,
      deleteItem:         CepheusActorSheet.#onDeleteItem,
      applyDamage:        CepheusActorSheet.#onApplyDamage,
      healDamage:         CepheusActorSheet.#onHealDamage,
      fullRecovery:       CepheusActorSheet.#onFullRecovery,
    },
  };

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
    biography: {
      template: "systems/cepheus-engine/templates/actor/biography.hbs",
      scrollable: [""],
    },
    notes: {
      template: "systems/cepheus-engine/templates/actor/notes.hbs",
      scrollable: [""],
    },
  };

  tabGroups = { primary: "characteristics" };

  async _onRender(context, options) {
    await super._onRender(context, options);
    preventEnterSubmit(this.element);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      tabs:               this._getTabs(),
      characteristics:    this.actor.system.characteristics ?? {},
      psi:                this.actor.system.psi ?? { value: 0, damage: 0, current: 0, dm: 0 },
      woundState:         this.actor.system.woundState ?? "healthy",
      woundPenalty:       this.actor.system.woundPenalty ?? 0,
      upp:                this.actor.system.upp ?? "??????",
      credits:            this.actor.system.credits ?? 0,
      skills:             this.actor.itemTypes.skill ?? [],
      weapons:            this.actor.itemTypes.weapon ?? [],
      armor:              this.actor.itemTypes.armor ?? [],
      equipment:          this.actor.itemTypes.equipment ?? [],
      augments:        this.actor.itemTypes.augment ?? [],
      charConfig:      CONFIG.CEPHEUS.characteristics,
    };
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs) context.tab = context.tabs[partId];
    return context;
  }

  _getTabs() {
    const group = "primary";
    const tabIds = ["characteristics", "skills", "equipment", "biography", "notes"];
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

  static async #onRollPsionic(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    await this.actor.rollPsionic(item, { promptDifficulty: event.shiftKey });
  }

  static async #onTestPsionics(event, target) {
    await this.actor.testPsionics();
  }

  static async #onRecoverPsi(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const amount = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.PsiRecover") },
      content: `<div class="form-group"><label>${game.i18n.localize("CEPHEUS.HealAmount")}</label><input type="number" name="amount" value="1" min="1" autofocus /></div>`,
      ok: { label: game.i18n.localize("CEPHEUS.Recover"), callback: (e, b) => b.form.elements.amount.valueAsNumber },
    });
    if (amount > 0) await this.actor.recoverPsi(amount);
  }

  static #onStartChargen(event, target) {
    new CepheusChargenApp(this.actor).render({ force: true });
  }

  static async #onRollCharacteristic(event, target) {
    const key = target.dataset.characteristic;
    await this.actor.rollCharacteristic(key);
  }

  static async #onRollSkill(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await this.actor.rollSkill(item);
  }

  static async #onRollAttack(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    await this.actor.rollAttack(item, { promptDifficulty: event.shiftKey });
  }

  static async #onRollDamage(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await this.actor.rollDamage(item);
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
    const { DialogV2 } = foundry.applications.api;
    const amount = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.ApplyDamage") },
      content: `<div class="form-group">
        <label>${game.i18n.localize("CEPHEUS.DamageAmount")}</label>
        <input type="number" name="damage" value="0" min="0" autofocus />
      </div>`,
      ok: {
        label: game.i18n.localize("CEPHEUS.Apply"),
        callback: (event, button) => button.form.elements.damage.valueAsNumber,
      },
    });
    if (amount > 0) await this.actor.applyDamage(amount);
  }

  static async #onHealDamage(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const amount = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.HealDamage") },
      content: `<div class="form-group">
        <label>${game.i18n.localize("CEPHEUS.HealAmount")}</label>
        <input type="number" name="heal" value="1" min="1" autofocus />
      </div>`,
      ok: {
        label: game.i18n.localize("CEPHEUS.Heal"),
        callback: (event, button) => button.form.elements.heal.valueAsNumber,
      },
    });
    if (amount > 0) await this.actor.healDamage(amount);
  }

  static async #onFullRecovery(event, target) {
    await this.actor.fullRecovery();
  }
}
