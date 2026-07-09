const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusCreatureSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "creature"],
    position: { width: 520, height: 500 },
    window: { resizable: true },
    actions: {
      rollAttack:   CepheusCreatureSheet.#onRollAttack,
      applyDamage:  CepheusCreatureSheet.#onApplyDamage,
      healDamage:   CepheusCreatureSheet.#onHealDamage,
      fullRecovery: CepheusCreatureSheet.#onFullRecovery,
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

  tabGroups = { primary: "stats" };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const sys = this.actor.system;
    return {
      ...context,
      tabs:             this._getTabs(),
      characteristics:  sys.characteristics ?? {},
      woundState:       sys.woundState ?? "healthy",
      armor:            sys.armor ?? 0,
      attackDice:       sys.attackDice ?? "2D6",
      attackType:       sys.attackType ?? "",
      speed:            sys.speed ?? 6,
      instinct:         sys.instinct ?? "",
      pack:             sys.pack ?? "",
      behaviorType:     sys.behaviorType ?? "carnivore",
      behaviorOptions:  CONFIG.CEPHEUS.behaviorTypes ?? {},
      notes:            sys.notes ?? "",
      charConfig:       CONFIG.CEPHEUS.characteristics,
    };
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs) context.tab = context.tabs[partId];
    return context;
  }

  _getTabs() {
    const group = "primary";
    return {
      stats: {
        id: "stats", group,
        active:   this.tabGroups[group] === "stats",
        cssClass: this.tabGroups[group] === "stats" ? "active" : "",
        label: "CEPHEUS.TabStats",
      },
      notes: {
        id: "notes", group,
        active:   this.tabGroups[group] === "notes",
        cssClass: this.tabGroups[group] === "notes" ? "active" : "",
        label: "CEPHEUS.TabNotes",
      },
    };
  }

  static async #onRollAttack(event, target) {
    const sys     = this.actor.system;
    const formula = (sys.attackDice ?? "2d6").toLowerCase();
    const roll    = await new Roll(formula).evaluate();
    const label   = sys.attackType || game.i18n.localize("CEPHEUS.AttackDice");
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor:  `<strong>${this.actor.name}</strong> — ${label}`,
    });
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

  static async #onFullRecovery() {
    await this.actor.fullRecovery();
  }
}
