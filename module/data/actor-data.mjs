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
    for (const char of Object.values(this.characteristics)) {
      char.current = Math.max(0, char.max - char.damage);
      char.value   = char.current; // alias: Foundry token bar reads .value
      char.dm = table[Math.clamp(char.current, 0, table.length - 1)];
      char.isDamaged = char.damage > 0;
      char.isDown = char.current === 0;
    }
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

    this._computeWoundState();
  }

  _computeWoundState() {
    const phys = ["str", "dex", "end"];
    const downCount = phys.filter(k => this.characteristics[k]?.current === 0).length;
    const anyDamaged = Object.values(this.characteristics).some(c => c.damage > 0);
    const endDown = this.characteristics.end?.current === 0;

    if      (downCount >= 3)                this.woundState = "dead";
    else if (downCount === 2 && endDown)    this.woundState = "dead";    // END=0 while seriously wounded
    else if (downCount === 2)               this.woundState = "mortally";
    else if (downCount === 1)               this.woundState = "seriously";
    else if (anyDamaged)                    this.woundState = "lightly";
    else                                    this.woundState = "healthy";

    if      (this.woundState === "lightly")                        this.woundPenalty = -1;
    else if (this.woundState === "seriously" ||
             this.woundState === "mortally")                       this.woundPenalty = -2;
    else                                                           this.woundPenalty = 0;
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
    const table = CONFIG.CEPHEUS.dmByValue;
    for (const char of Object.values(this.characteristics)) {
      char.current = Math.max(0, char.max - char.damage);
      char.value   = char.current;
      char.dm = table[Math.clamp(char.current, 0, table.length - 1)];
      char.isDamaged = char.damage > 0;
      char.isDown = char.current === 0;
    }
    const phys = ["str", "dex", "end"];
    const downCount  = phys.filter(k => this.characteristics[k]?.current === 0).length;
    const anyDamaged = Object.values(this.characteristics).some(c => c.damage > 0);
    const endDown    = this.characteristics.end?.current === 0;

    if      (downCount >= 3)             this.woundState = "dead";
    else if (downCount === 2 && endDown) this.woundState = "dead";
    else if (downCount === 2)            this.woundState = "mortally";
    else if (downCount === 1)            this.woundState = "seriously";
    else if (anyDamaged)                 this.woundState = "lightly";
    else                                 this.woundState = "healthy";

    if      (this.woundState === "lightly")   this.woundPenalty = -1;
    else if (this.woundState === "seriously" ||
             this.woundState === "mortally")  this.woundPenalty = -2;
    else                                       this.woundPenalty = 0;
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
      notes:          new fields.HTMLField({ initial: "" }),
    };
  }

  prepareDerivedData() {
    this.hardpoints    = Math.floor(this.displacement / 100);
    this.fuelPerJump   = this.jumpRating * (this.displacement * 0.1);
    // Power plant fuel consumption: rating × 1% of displacement per 4 weeks
    this.fuelPerMonth  = this.powerPlant * (this.displacement * 0.01);
    this.freeCargo     = Math.max(0, this.cargoCapacity - this.cargoUsed);
  }
}
