import { CEPHEUS } from "../config/config.mjs";

const { fields } = foundry.data;

// Enum choices derive from the config key lists so a new weapon type, mount,
// or characteristic only has to be added in config.mjs (+ lang/en.json).
const CHARACTERISTIC_KEYS = Object.keys(CEPHEUS.characteristics);

export class SkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      level: new fields.NumberField({
        required: true, integer: true, min: 0, max: 5, initial: 0,
      }),
      characteristic: new fields.StringField({
        initial: "int",
        choices: CHARACTERISTIC_KEYS,
      }),
      psionic: new fields.BooleanField({ initial: false }),
      costPsi: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      damage:      new fields.StringField({ required: true, initial: "2d6" }),
      range:       new fields.StringField({ initial: "" }),
      skill:       new fields.StringField({ initial: "" }),
      magazine:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      tl:          new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      cost:        new fields.NumberField({ required: true, min: 0, initial: 0 }),
      mass:        new fields.NumberField({ required: true, min: 0, initial: 0 }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class ArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      protection: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      // Some armors (Ablat, Reflec) rate differently against laser attacks; null means same as `protection`.
      protectionLaser: new fields.NumberField({ required: false, integer: true, min: 0, initial: null, nullable: true }),
      skillRequired: new fields.StringField({ initial: "" }),
      tl:         new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      cost:       new fields.NumberField({ required: true, min: 0, initial: 0 }),
      mass:       new fields.NumberField({ required: true, min: 0, initial: 0 }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class EquipmentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      tl:          new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      cost:        new fields.NumberField({ required: true, min: 0, initial: 0 }),
      mass:        new fields.NumberField({ required: true, min: 0, initial: 0 }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class AugmentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristic: new fields.StringField({
        initial: "",
        blank: true,
        // Augments boost physical/mental characteristics only, never PSI.
        choices: ["", ...CHARACTERISTIC_KEYS.filter(k => k !== "psi")],
      }),
      bonus:       new fields.NumberField({ required: true, integer: true, initial: 0 }),
      tl:          new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      cost:        new fields.NumberField({ required: true, min: 0, initial: 0 }),
      description: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class ShipComponentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      componentType:  new fields.StringField({ initial: "" }),
      tonnage:        new fields.NumberField({ required: true, min: 0, initial: 0 }),
      powerRequired:  new fields.NumberField({ required: true, min: 0, initial: 0 }),
      cost:           new fields.NumberField({ required: true, min: 0, initial: 0 }),
      // Weapon systems only — leave weaponType "" for non-weapon components
      // (staterooms, drives, etc.), which makes the space-combat attack UI
      // and hit-location "Turret"/"Bay" resolution ignore them.
      weaponType: new fields.StringField({
        initial: "",
        blank: true,
        choices: Object.keys(CEPHEUS.spaceCombat.weaponTypes),
      }),
      mount:  new fields.StringField({ initial: "", blank: true, choices: Object.keys(CEPHEUS.spaceCombat.mounts) }),
      damage: new fields.StringField({ initial: "" }),
      // Turret/Bay damage track (SRD p.159-160): 0=undamaged, 1=DM-2 to
      // attacks, 2=disabled, 3=destroyed. Further hits redirect to the ship's
      // Hull (turret) or Structure (bay).
      hits: new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      // Missiles-in-magazine (weaponType "missile") or sand canisters
      // (weaponType "sandcaster") — a launch/firing consumes ammo, GM sets
      // the starting count by hand (no ammo is included in a launcher's
      // purchase cost per SRD p.130).
      ammo: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      // Only meaningful when weaponType is "missile" — see
      // CEPHEUS.spaceCombat.missileTypes.
      missileType: new fields.StringField({
        initial: "standard",
        choices: Object.keys(CEPHEUS.spaceCombat.missileTypes),
      }),
      // Independent of weaponType — screens are defensive installations, not
      // weapons. "" = this component isn't a screen.
      screenType: new fields.StringField({
        initial: "",
        blank: true,
        choices: ["", ...Object.keys(CEPHEUS.spaceCombat.screenTypes)],
      }),
      description:    new fields.HTMLField({ initial: "" }),
    };
  }
}
