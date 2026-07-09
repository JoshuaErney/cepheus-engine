const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusShipSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "ship"],
    position: { width: 700, height: 580 },
    window: { resizable: true },
    actions: {
      createComponent:      CepheusShipSheet.#onCreateComponent,
      editItem:             CepheusShipSheet.#onEditItem,
      deleteItem:           CepheusShipSheet.#onDeleteItem,
      applyHullDamage:      CepheusShipSheet.#onApplyHullDamage,
      applyStructureDamage: CepheusShipSheet.#onApplyStructureDamage,
    },
  };

  static PARTS = {
    header: {
      template: "systems/cepheus-engine/templates/actor/ship/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    statistics: {
      template: "systems/cepheus-engine/templates/actor/ship/statistics.hbs",
      scrollable: [""],
    },
    components: {
      template: "systems/cepheus-engine/templates/actor/ship/components.hbs",
      scrollable: [""],
    },
    notes: {
      template: "systems/cepheus-engine/templates/actor/ship/notes.hbs",
      scrollable: [""],
    },
  };

  tabGroups = { primary: "statistics" };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const sys = this.actor.system;
    const components = this.actor.itemTypes.shipComponent ?? [];

    return {
      ...context,
      tabs:            this._getTabs(),
      shipClass:       sys.shipClass ?? "",
      displacement:    sys.displacement ?? 100,
      hullPoints:      sys.hullPoints,
      structurePoints: sys.structurePoints,
      armor:           sys.armor ?? 0,
      hardpoints:      sys.hardpoints ?? 0,
      jumpRating:      sys.jumpRating ?? 0,
      maneuverRating:  sys.maneuverRating ?? 1,
      powerPlant:      sys.powerPlant ?? 1,
      fuel:            sys.fuel,
      fuelPerJump:     sys.fuelPerJump ?? 0,
      fuelPerMonth:    sys.fuelPerMonth ?? 0,
      cargoCapacity:   sys.cargoCapacity ?? 0,
      cargoUsed:       sys.cargoUsed ?? 0,
      freeCargo:       sys.freeCargo ?? 0,
      crewMin:         sys.crewMin ?? 1,
      credits:         sys.credits ?? 0,
      components,
      usedTonnage:     sys.usedTonnage ?? 0,
      usedPower:       sys.usedPower   ?? 0,
      notes:           sys.notes ?? "",
    };
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs) context.tab = context.tabs[partId];
    return context;
  }

  _getTabs() {
    const group = "primary";
    const tabIds = ["statistics", "components", "notes"];
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

  static async #onCreateComponent(event, target) {
    await Item.create(
      { name: game.i18n.localize("TYPES.Item.shipComponent"), type: "shipComponent" },
      { parent: this.actor }
    );
  }

  static async #onEditItem(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    await item?.sheet.render({ force: true });
  }

  static async #onDeleteItem(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await item.delete();
  }

  static async #onApplyHullDamage(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const amount = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.ApplyHullDamage") },
      content: `<div class="form-group">
        <label>${game.i18n.localize("CEPHEUS.DamageAmount")}</label>
        <input type="number" name="damage" value="0" min="0" autofocus />
      </div>`,
      ok: {
        label: game.i18n.localize("CEPHEUS.Apply"),
        callback: (event, button) => button.form.elements.damage.valueAsNumber,
      },
    });
    if (amount > 0) {
      const hp = this.actor.system.hullPoints;
      await this.actor.update({
        "system.hullPoints.value": Math.max(0, hp.value - amount),
      });
    }
  }

  static async #onApplyStructureDamage(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const amount = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.ApplyStructureDamage") },
      content: `<div class="form-group">
        <label>${game.i18n.localize("CEPHEUS.DamageAmount")}</label>
        <input type="number" name="damage" value="0" min="0" autofocus />
      </div>`,
      ok: {
        label: game.i18n.localize("CEPHEUS.Apply"),
        callback: (event, button) => button.form.elements.damage.valueAsNumber,
      },
    });
    if (amount > 0) {
      const sp = this.actor.system.structurePoints;
      await this.actor.update({
        "system.structurePoints.value": Math.max(0, sp.value - amount),
      });
    }
  }
}
