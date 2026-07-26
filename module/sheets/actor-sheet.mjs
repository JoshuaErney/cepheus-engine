import { CepheusChargenApp } from "../apps/chargen.mjs";
import { CepheusBaseActorSheet } from "./base-actor-sheet.mjs";
import { promptNumber } from "../helpers/dialogs.mjs";

export class CepheusActorSheet extends CepheusBaseActorSheet {
  static DEFAULT_OPTIONS = {
    position: { width: 720, height: 620 },
    actions: {
      startChargen:       CepheusActorSheet.#onStartChargen,
      rollCharacteristic: CepheusActorSheet.#onRollCharacteristic,
      rollSkill:          CepheusActorSheet.#onRollSkill,
      rollAttack:         CepheusActorSheet.#onRollAttack,
      rollDamage:         CepheusActorSheet.#onRollDamage,
      rollPsionic:        CepheusActorSheet.#onRollPsionic,
      testPsionics:       CepheusActorSheet.#onTestPsionics,
      recoverPsi:         CepheusActorSheet.#onRecoverPsi,
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

  static TABS = ["characteristics", "skills", "equipment", "biography", "notes"];

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return {
      ...context,
      isCharacter: this.actor.type === "character",
      skills:     this.actor.itemTypes.skill,
      weapons:    this.actor.itemTypes.weapon,
      armor:      this.actor.itemTypes.armor,
      equipment:  this.actor.itemTypes.equipment,
      augments:   this.actor.itemTypes.augment,
      charConfig: CONFIG.CEPHEUS.characteristics,
    };
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
    const amount = await promptNumber({
      title:   "CEPHEUS.PsiRecover",
      label:   "CEPHEUS.HealAmount",
      initial: 1,
      min:     1,
      okLabel: "CEPHEUS.Recover",
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
}
