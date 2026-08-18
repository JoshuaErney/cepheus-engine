import { CepheusBaseActorSheet } from "./base-actor-sheet.mjs";
import { promptForm } from "../helpers/dialogs.mjs";

export class CepheusShipSheet extends CepheusBaseActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["cepheus-engine", "actor", "ship"],
    position: { width: 700, height: 580 },
    actions: {
      rollInitiative:      CepheusShipSheet.#onRollInitiative,
      rollAttack:          CepheusShipSheet.#onRollAttack,
      rollWeaponDamage:    CepheusShipSheet.#onRollWeaponDamage,
      applyShipHit:        CepheusShipSheet.#onApplyShipHit,
      adjustSystemHit:     CepheusShipSheet.#onAdjustSystemHit,
      adjustMountHit:      CepheusShipSheet.#onAdjustMountHit,
      launchMissile:       CepheusShipSheet.#onLaunchMissile,
      resolveMissileImpact: CepheusShipSheet.#onResolveMissileImpact,
      pointDefense:        CepheusShipSheet.#onPointDefense,
      fireSand:            CepheusShipSheet.#onFireSand,
      triggerScreens:      CepheusShipSheet.#onTriggerScreens,
      boardingAction:      CepheusShipSheet.#onBoardingAction,
      reloadWeapon:        CepheusShipSheet.#onReloadWeapon,
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

  static TABS = ["statistics", "components", "notes"];

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const sys = this.actor.system;

    return {
      ...context,
      components: this.actor.itemTypes.shipComponent,
      // One row per subsystem damage track, derived from the config registry
      // so new subsystems only need a config entry + <key>Hits schema field.
      systemHitRows: Object.keys(CONFIG.CEPHEUS.spaceCombat.subsystems).map(key => ({
        key,
        label: CONFIG.CEPHEUS.spaceCombat.locationLabels[key],
        value: sys[`${key}Hits`],
      })),
      weaponTypeLabels:  CONFIG.CEPHEUS.spaceCombat.weaponTypes,
      mountLabels:       CONFIG.CEPHEUS.spaceCombat.mounts,
      missileTypeLabels: CONFIG.CEPHEUS.spaceCombat.missileTypes,
      screenTypeLabels:  CONFIG.CEPHEUS.spaceCombat.screenTypes,
    };
  }

  static async #onRollInitiative(event, target) {
    const result = await promptForm({
      title:   "CEPHEUS.ShipInitiative",
      okLabel: "CEPHEUS.RollInitiative",
      fields: [
        { type: "checkbox", name: "thrustAdvantage", label: "CEPHEUS.ThrustAdvantage" },
        { type: "number",   name: "tacticsEffect",   label: "CEPHEUS.TacticsEffect" },
      ],
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
    const result = await promptForm({
      title: "CEPHEUS.ApplyHit",
      fields: [
        { type: "number", name: "damage", label: "CEPHEUS.DamageAmount", min: 0 },
        {
          type: "select", name: "radiation", label: "CEPHEUS.Radiation", selected: "",
          options: {
            "":        "CEPHEUS.RadiationNone",
            standard:  "CEPHEUS.RadiationStandard",
            meson:     "CEPHEUS.RadiationMeson",
          },
        },
      ],
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

  static async #onLaunchMissile(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await this.actor.rollShipMissileLaunch(item);
  }

  static async #onResolveMissileImpact(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    const result = await promptForm({
      title:   "CEPHEUS.ResolveMissileImpact",
      okLabel: "CEPHEUS.ResolveMissileImpact",
      fields: [
        { type: "number", name: "toHitTarget", label: "CEPHEUS.MissileToHitTarget", value: 8, min: 2 },
        { type: "number", name: "reactionDM",  label: "CEPHEUS.ReactionDM",         value: 0 },
      ],
    });
    if (result) {
      await this.actor.rollShipMissileImpact(item, {
        toHitTarget: result.toHitTarget,
        reactionDM:  result.reactionDM,
        missileType: item.system.missileType,
      });
    }
  }

  static async #onPointDefense(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    const result = await promptForm({
      title:   "CEPHEUS.PointDefense",
      okLabel: "CEPHEUS.PointDefense",
      fields: [
        { type: "number", name: "dm",             label: "CEPHEUS.SkillPlusDM", value: 0 },
        { type: "number", name: "attemptNumber",  label: "CEPHEUS.AttemptNumber", value: 1, min: 1 },
      ],
    });
    if (result) await this.actor.rollShipPointDefense(item, result);
  }

  static async #onFireSand(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    const result = await promptForm({
      title:   "CEPHEUS.FireSand",
      okLabel: "CEPHEUS.FireSand",
      fields: [{ type: "number", name: "dm", label: "CEPHEUS.SkillPlusDM", value: 0 }],
    });
    if (result) await this.actor.rollShipFireSand(item, result);
  }

  static async #onTriggerScreens(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (!item) return;
    const result = await promptForm({
      title:   "CEPHEUS.TriggerScreens",
      okLabel: "CEPHEUS.TriggerScreens",
      fields: [{ type: "number", name: "skillLevel", label: "CEPHEUS.ScreensSkillLevel", value: 0, min: 0 }],
    });
    if (result) await this.actor.rollShipTriggerScreens(item, result);
  }

  static async #onBoardingAction(event, target) {
    const result = await promptForm({
      title:   "CEPHEUS.BoardingAction",
      okLabel: "CEPHEUS.BoardingAction",
      fields: [
        { type: "number", name: "attackerDM", label: "CEPHEUS.AttackerDM", value: 0 },
        { type: "number", name: "defenderDM", label: "CEPHEUS.DefenderDM", value: 0 },
      ],
    });
    if (result) await this.actor.rollShipBoardingRound(result);
  }

  static async #onReloadWeapon(event, target) {
    const item = this.actor.items.get(target.dataset.itemId);
    if (item) await this.actor.rollShipReloadWeapon(item);
  }
}
