import { preventEnterSubmit } from "../helpers/form.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusShipSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "ship"],
    position: { width: 700, height: 580 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      createComponent: CepheusShipSheet.#onCreateComponent,
      editItem:         CepheusShipSheet.#onEditItem,
      deleteItem:       CepheusShipSheet.#onDeleteItem,
      rollInitiative:   CepheusShipSheet.#onRollInitiative,
      rollAttack:       CepheusShipSheet.#onRollAttack,
      rollWeaponDamage: CepheusShipSheet.#onRollWeaponDamage,
      applyShipHit:     CepheusShipSheet.#onApplyShipHit,
      adjustSystemHit:  CepheusShipSheet.#onAdjustSystemHit,
      adjustMountHit:   CepheusShipSheet.#onAdjustMountHit,
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

  async _onRender(context, options) {
    await super._onRender(context, options);
    preventEnterSubmit(this.element);
  }

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
      systemHitRows: [
        { key: "sensors",    label: "CEPHEUS.SysSensorsName",    value: sys.sensorsHits    ?? 0 },
        { key: "mDrive",     label: "CEPHEUS.SysMDriveName",     value: sys.mDriveHits     ?? 0 },
        { key: "jDrive",     label: "CEPHEUS.SysJDriveName",     value: sys.jDriveHits     ?? 0 },
        { key: "powerPlant", label: "CEPHEUS.SysPowerPlantName", value: sys.powerPlantHits ?? 0 },
        { key: "bridge",     label: "CEPHEUS.SysBridgeName",     value: sys.bridgeHits     ?? 0 },
        { key: "fuel",       label: "CEPHEUS.SysFuelName",       value: sys.fuelHits       ?? 0 },
        { key: "hold",       label: "CEPHEUS.SysHoldName",       value: sys.holdHits       ?? 0 },
      ],
      weaponTypeLabels: CONFIG.CEPHEUS.spaceCombat.weaponTypes,
      mountLabels:      CONFIG.CEPHEUS.spaceCombat.mounts,
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

  static async #onRollInitiative(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const result = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.ShipInitiative") },
      content: `<div class="form-group">
        <label><input type="checkbox" name="thrustAdvantage" /> ${game.i18n.localize("CEPHEUS.ThrustAdvantage")}</label>
      </div>
      <div class="form-group">
        <label>${game.i18n.localize("CEPHEUS.TacticsEffect")}</label>
        <input type="number" name="tacticsEffect" value="0" />
      </div>`,
      ok: {
        label: game.i18n.localize("CEPHEUS.RollInitiative"),
        callback: (event, button) => ({
          thrustAdvantage: button.form.elements.thrustAdvantage.checked,
          tacticsEffect:   button.form.elements.tacticsEffect.valueAsNumber || 0,
        }),
      },
    });
    if (result) await this.actor.rollShipInitiative(result);
  }

  static async #onRollAttack(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await this.actor.rollShipAttack(item);
  }

  static async #onRollWeaponDamage(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await this.actor.rollShipWeaponDamage(item);
  }

  static async #onApplyShipHit(event, target) {
    const { DialogV2 } = foundry.applications.api;
    const result = await DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.ApplyHit") },
      content: `<div class="form-group">
        <label>${game.i18n.localize("CEPHEUS.DamageAmount")}</label>
        <input type="number" name="damage" value="0" min="0" autofocus />
      </div>
      <div class="form-group">
        <label><input type="checkbox" name="radiation" /> ${game.i18n.localize("CEPHEUS.Radiation")}</label>
      </div>`,
      ok: {
        label: game.i18n.localize("CEPHEUS.Apply"),
        callback: (event, button) => ({
          damage:    button.form.elements.damage.valueAsNumber,
          radiation: button.form.elements.radiation.checked,
        }),
      },
    });
    if (result && result.damage > 0) {
      await this.actor.applyShipDamage(result.damage, { radiation: result.radiation });
    }
  }

  static async #onAdjustSystemHit(event, target) {
    const field = target.dataset.system;
    const delta = Number(target.dataset.delta);
    const current = this.actor.system[`${field}Hits`] ?? 0;
    const value = Math.clamp(current + delta, 0, 3);
    await this.actor.update({ [`system.${field}Hits`]: value });
  }

  static async #onAdjustMountHit(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    const delta = Number(target.dataset.delta);
    const value = Math.clamp((item.system.hits ?? 0) + delta, 0, 3);
    await item.update({ "system.hits": value });
  }
}
