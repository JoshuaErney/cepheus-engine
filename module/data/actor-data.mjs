import { computeCharacteristicDerived, computeWoundState } from "../helpers/characteristics.mjs";

const { fields } = foundry.data;

function characteristicField(initial = 7) {
  return new fields.SchemaField({
    max:    new fields.NumberField({ required: true, integer: true, min: 0, max: 15, initial }),
    damage: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
  });
}

// Shared base for humanoid actors (character, npc)
class HumanoidData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristics: new fields.SchemaField({
        str: characteristicField(7),
        dex: characteristicField(7),
        end: characteristicField(7),
        int: characteristicField(7),
        edu: characteristicField(7),
        soc: characteristicField(7),
      }),
      psi: new fields.SchemaField({
        value:  new fields.NumberField({ required: true, integer: true, min: 0, max: 15, initial: 0 }),
        damage: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),
      credits: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    };
  }

  prepareDerivedData() {
    const table = CONFIG.CEPHEUS.dmByValue;
    computeCharacteristicDerived(this.characteristics);
    this.upp = Object.values(this.characteristics)
      .map(c => Math.clamp(c.max, 0, 15).toString(16).toUpperCase())
      .join("");

    // PSI — DM is based on CURRENT points (spending reduces effectiveness)
    if (this.psi) {
      this.psi.current  = Math.max(0, this.psi.value - this.psi.damage);
      this.psi.dm       = table[Math.clamp(this.psi.current, 0, table.length - 1)];
      this.psi.isDamaged = this.psi.damage > 0;
      this.psi.isDown   = this.psi.current === 0;
    }

    Object.assign(this, computeWoundState(this.characteristics));
  }
}

export class CharacterData extends HumanoidData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      age:      new fields.NumberField({ required: true, integer: true, min: 18, initial: 18 }),
      career:   new fields.StringField({ initial: "" }),
      terms:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      // Annual retirement pension (SRD p.30): 5+ terms in a single career grants
      // Cr10,000 at 5 terms, +Cr2,000 per term thereafter.
      pension:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      // SRD "Final Details" (p.41): Gender, Appearance, Personal Goals.
      gender:        new fields.StringField({ initial: "" }),
      appearance:    new fields.HTMLField({ initial: "" }),
      personalGoals: new fields.HTMLField({ initial: "" }),
      biography: new fields.HTMLField({ initial: "" }),
      notes:     new fields.HTMLField({ initial: "" }),
    };
  }
}

export class NpcData extends HumanoidData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      notes: new fields.HTMLField({ initial: "" }),
    };
  }
}

export class CreatureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristics: new fields.SchemaField({
        str: characteristicField(7),
        dex: characteristicField(7),
        end: characteristicField(7),
        int: characteristicField(5),
      }),
      armor:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      attackDice:   new fields.StringField({ initial: "2D6" }),
      attackType:   new fields.StringField({ initial: "" }),
      instinct:     new fields.StringField({ initial: "" }),
      pack:         new fields.StringField({ initial: "" }),
      speed:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 6 }),
      behaviorType: new fields.StringField({
        initial: "carnivore",
        choices: ["carnivore", "herbivore", "omnivore", "scavenger", "hijacker", "intermittent", "filter"],
      }),
      notes: new fields.HTMLField({ initial: "" }),
    };
  }

  prepareDerivedData() {
    computeCharacteristicDerived(this.characteristics);
    Object.assign(this, computeWoundState(this.characteristics));
  }
}

export class ShipData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      shipClass:      new fields.StringField({ initial: "" }),
      displacement:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 100 }),
      hullPoints: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 2 }),
        max:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 2 }),
      }),
      structurePoints: new fields.SchemaField({
        value: new fields.NumberField({ required: true, integer: true, min: 0, initial: 2 }),
        max:   new fields.NumberField({ required: true, integer: true, min: 0, initial: 2 }),
      }),
      armor:          new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      jumpRating:     new fields.NumberField({ required: true, integer: true, min: 0, max: 6, initial: 0 }),
      maneuverRating: new fields.NumberField({ required: true, integer: true, min: 0, max: 6, initial: 1 }),
      powerPlant:     new fields.NumberField({ required: true, integer: true, min: 0, max: 6, initial: 1 }),
      fuel: new fields.SchemaField({
        value:    new fields.NumberField({ required: true, min: 0, initial: 0 }),
        capacity: new fields.NumberField({ required: true, min: 0, initial: 0 }),
      }),
      cargoCapacity:  new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      cargoUsed:      new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      crewMin:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      credits:        new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      // Space combat subsystem damage tracks (SRD p.159-161), each 0-3 tiers.
      // Turret/Bay hits are tracked per-weapon-component instead (see
      // ShipComponentData) since a ship can have several of each.
      sensorsHits:    new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      mDriveHits:     new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      jDriveHits:     new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      powerPlantHits: new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      bridgeHits:     new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      fuelHits:       new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      holdHits:       new fields.NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      notes:          new fields.HTMLField({ initial: "" }),
    };
  }

  prepareDerivedData() {
    this.hardpoints    = Math.floor(this.displacement / 100);
    this.fuelPerJump   = this.jumpRating * (this.displacement * 0.1);
    // Power plant fuel consumption: rating × 1% of displacement per 4 weeks
    this.fuelPerMonth  = this.powerPlant * (this.displacement * 0.01);
    this.freeCargo     = Math.max(0, this.cargoCapacity - this.cargoUsed);
    // Space Combat Hit Location table uses a separate column for vessels
    // under 100 tons (SRD p.159).
    this.isSmallCraft  = this.displacement < 100;
  }
}
