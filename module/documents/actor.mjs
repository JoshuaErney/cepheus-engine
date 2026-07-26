import { damageToHits, applyTieredHit } from "../helpers/spacecombat.mjs";
import { evaluateCheck, formatCheckFlavor, isDiceFormula, normalizeDiceFormula, signed } from "../helpers/dice.mjs";
import { promptSelect } from "../helpers/dialogs.mjs";

export class CepheusActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "ship") {
      const components = this.itemTypes.shipComponent ?? [];
      this.system.usedTonnage = components.reduce((s, c) => s + (c.system.tonnage        ?? 0), 0);
      this.system.usedPower   = components.reduce((s, c) => s + (c.system.powerRequired  ?? 0), 0);
    }
  }

  // Supply @characteristics.key.dm etc. to roll formulas and the initiative roll.
  getRollData() {
    const data = super.getRollData();
    const sys = this.system;
    if (sys.characteristics) {
      data.characteristics = {};
      for (const [key, char] of Object.entries(sys.characteristics)) {
        data.characteristics[key] = {
          value:   char.current ?? 0,
          max:     char.max     ?? 0,
          damage:  char.damage  ?? 0,
          current: char.current ?? 0,
          dm:      char.dm      ?? 0,
        };
      }
    }
    return data;
  }

  // ── Skill helpers ────────────────────────────────────────────────────────

  findSkillByName(skillName) {
    return this.items.find(i => i.type === "skill" && i.name === skillName) ?? null;
  }

  // Returns the effective skill level, accounting for the unskilled -3 penalty
  // and Jack-of-All-Trades reduction.
  getSkillLevel(skillName) {
    const skill = this.findSkillByName(skillName);
    if (skill) return skill.system.level ?? 0;

    const jot = this.findSkillByName("Jack-of-All-Trades");
    const jotLevel = jot?.system.level ?? 0;
    return Math.min(0, -3 + jotLevel);   // -3 unskilled, JoT reduces penalty
  }

  // ── Characteristic rolls ─────────────────────────────────────────────────

  async rollCharacteristic(characteristicKey) {
    const char = this.system.characteristics?.[characteristicKey];
    if (!char) return null;

    const label       = game.i18n.localize(CONFIG.CEPHEUS.characteristics[characteristicKey]);
    const woundPenalty = this.system.woundPenalty ?? 0;
    const roll  = await new Roll(`2d6 + ${char.dm + woundPenalty}`).evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:  game.i18n.format("CEPHEUS.RollCharacteristic", { characteristic: label }),
    });
    return roll;
  }

  // ── Skill rolls ──────────────────────────────────────────────────────────

  async rollSkill(skillItem, options = {}) {
    const characteristicKey = options.characteristicKey ?? skillItem.system.characteristic;
    const char       = this.system.characteristics?.[characteristicKey];
    const skillLevel = skillItem.system.level ?? 0;
    const woundPenalty = this.system.woundPenalty ?? 0;
    const charDm      = char?.dm ?? 0;

    const check = await evaluateCheck({
      dm:         charDm + skillLevel + woundPenalty,
      difficulty: options.difficulty ?? "average",
    });
    const charLabel = game.i18n.localize(CONFIG.CEPHEUS.characteristics[characteristicKey] ?? "");

    await check.roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: formatCheckFlavor({
        title:   skillItem.name,
        kind:    "Skill Check",
        detail:  `Skill ${skillLevel} / ${charLabel} DM${signed(charDm)} / ${check.diffLabel} (${check.target}+)`,
        outcome: check,
      }),
    });
    return { roll: check.roll, success: check.success };
  }

  // ── Shared difficulty picker ─────────────────────────────────────────────

  async _promptDifficulty(defaultDifficulty = "average") {
    const choices = Object.fromEntries(
      Object.entries(CONFIG.CEPHEUS.difficulties).map(([k, v]) => [k, v.label])
    );
    return promptSelect({
      title:    "CEPHEUS.SelectDifficulty",
      label:    "CEPHEUS.SelectDifficulty",
      choices,
      selected: defaultDifficulty,
      okLabel:  "CEPHEUS.RollAttack",
    });
  }

  async _promptRange(defaultRange = "short") {
    return promptSelect({
      title:    "CEPHEUS.SelectRange",
      label:    "CEPHEUS.SelectRange",
      choices:  CONFIG.CEPHEUS.spaceCombat.rangeBands,
      selected: defaultRange,
      okLabel:  "CEPHEUS.RollAttack",
    });
  }

  // ── Attack rolls ─────────────────────────────────────────────────────────

  async rollAttack(weaponItem, options = {}) {
    const skillName  = weaponItem.system.skill ?? "";
    const skillLevel = this.getSkillLevel(skillName);
    const isMelee    = weaponItem.system.range?.startsWith("Melee") ?? false;
    const charKey    = options.characteristicKey ?? (isMelee ? "str" : "dex");
    const char       = this.system.characteristics?.[charKey];
    const charDm      = char?.dm ?? 0;
    const woundPenalty = this.system.woundPenalty ?? 0;

    const difficulty  = options.promptDifficulty
      ? (await this._promptDifficulty(options.difficulty ?? "average"))
      : (options.difficulty ?? "average");
    if (!difficulty) return null;

    const check = await evaluateCheck({ dm: skillLevel + charDm + woundPenalty, difficulty });

    const charLabel  = game.i18n.localize(CONFIG.CEPHEUS.characteristics[charKey] ?? "");
    const skillTag   = skillLevel < 0
      ? `${skillName} (unskilled ${skillLevel})`
      : `${skillName} ${skillLevel}`;

    await check.roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: formatCheckFlavor({
        title:   weaponItem.name,
        kind:    "Attack Roll",
        detail:  `${skillTag} / ${charLabel} DM${signed(charDm)} / ${check.diffLabel} (${check.target}+)`,
        outcome: check,
      }),
    });

    return { roll: check.roll, success: check.success };
  }

  // ── Psionic rolls ────────────────────────────────────────────────────────

  async testPsionics() {
    const terms = this.system.terms ?? 0;
    const r     = await new Roll("2d6").evaluate();
    const score = Math.max(0, r.total - terms);
    await this.update({ "system.psi.value": score, "system.psi.damage": 0 });
    await r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:  `${this.name} — ${game.i18n.localize("CEPHEUS.PsiTest")} (${r.total} − ${terms} terms = PSI ${score})`,
    });
    if (score === 0) ui.notifications.info(`${this.name}: ${game.i18n.localize("CEPHEUS.PsiNone")}`);
    return score;
  }

  async rollPsionic(skillItem, options = {}) {
    const psi = this.system.psi;
    if (!psi || psi.value === 0) {
      ui.notifications.warn(game.i18n.localize("CEPHEUS.PsiNone"));
      return null;
    }

    const cost = skillItem.system.costPsi ?? 0;
    if (psi.current < cost) {
      ui.notifications.warn(game.i18n.localize("CEPHEUS.PsiInsufficient"));
      return null;
    }

    if (cost > 0) {
      await this.update({ "system.psi.damage": psi.damage + cost });
    }

    const difficulty  = options.promptDifficulty
      ? (await this._promptDifficulty(options.difficulty ?? "average"))
      : (options.difficulty ?? "average");
    if (!difficulty) return null;

    const skillLevel  = skillItem.system.level ?? 0;
    const woundPenalty = this.system.woundPenalty ?? 0;

    const check = await evaluateCheck({ dm: skillLevel + psi.dm + woundPenalty, difficulty });

    await check.roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: formatCheckFlavor({
        title:   skillItem.name,
        kind:    "Psionic Roll",
        detail:  `PSI DM${signed(psi.dm)} + Skill ${skillLevel} / Cost: ${cost} PSI / ${check.diffLabel} (${check.target}+)`,
        outcome: check,
      }),
    });
    return { roll: check.roll, success: check.success };
  }

  async recoverPsi(amount) {
    const psi = this.system.psi;
    if (!psi) return;
    const recovered = Math.min(amount, psi.damage);
    if (recovered > 0) await this.update({ "system.psi.damage": psi.damage - recovered });
  }

  // ── Damage rolls ─────────────────────────────────────────────────────────

  async rollDamage(weaponItem) {
    const raw = weaponItem.system.damage ?? "2d6";

    // Some damage entries are descriptive (e.g. "By grenade") — bail out gracefully.
    if (!isDiceFormula(raw)) {
      ui.notifications.info(`${weaponItem.name}: ${raw}`);
      return null;
    }

    const roll = await new Roll(normalizeDiceFormula(raw)).evaluate();

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: formatCheckFlavor({
        title:  weaponItem.name,
        kind:   "Damage",
        detail: "Roll damage then subtract target's armor",
      }),
    });

    return roll;
  }

  // Creature natural attack: rolls system.attackDice flat — creatures have no
  // skill items, so there is no skill/characteristic DM math (SRD stat-block
  // convention). Lives here rather than on the sheet so macros can call it.
  async rollCreatureAttack() {
    const raw = this.system.attackDice ?? "2d6";
    if (!isDiceFormula(raw)) {
      ui.notifications.info(`${this.name}: ${raw}`);
      return null;
    }
    const roll  = await new Roll(normalizeDiceFormula(raw)).evaluate();
    const label = this.system.attackType || game.i18n.localize("CEPHEUS.AttackDice");
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:  `<strong>${this.name}</strong> — ${label}`,
    });
    return roll;
  }

  // ── Wound / Damage helpers ───────────────────────────────────────────────

  async applyDamage(total) {
    const chars = this.system.characteristics;
    if (!chars) return;
    const updates = {};
    let remaining = total;

    for (const key of ["end", "str", "dex"]) {
      if (!chars[key] || remaining <= 0) continue;
      const take = Math.min(remaining, chars[key].current);
      if (take > 0) {
        updates[`system.characteristics.${key}.damage`] = chars[key].damage + take;
        remaining -= take;
      }
    }

    await this.update(updates);
    this._notifyWoundState();
  }

  async healDamage(total) {
    const chars = this.system.characteristics;
    if (!chars) return;
    const updates = {};
    let remaining = total;

    for (const key of ["dex", "str", "end"]) {
      if (!chars[key] || remaining <= 0) continue;
      const heal = Math.min(remaining, chars[key].damage);
      if (heal > 0) {
        updates[`system.characteristics.${key}.damage`] = chars[key].damage - heal;
        remaining -= heal;
      }
    }

    await this.update(updates);
  }

  async fullRecovery() {
    const chars = this.system.characteristics;
    if (!chars) return;
    const updates = {};
    for (const key of Object.keys(chars)) {
      updates[`system.characteristics.${key}.damage`] = 0;
    }
    await this.update(updates);
  }

  _notifyWoundState() {
    const state = this.system.woundState;
    if (!state || state === "healthy" || state === "lightly") return;
    const label = game.i18n.localize(
      `CEPHEUS.Wound${state.charAt(0).toUpperCase() + state.slice(1)}`
    );
    ui.notifications.warn(`${this.name}: ${label}`);
  }

  // ── Ship combat (SRD Chapter 10) ────────────────────────────────────────

  // 2D6 + Thrust DM (+1 if this ship has greater Thrust than its opponent,
  // determined by the GM/player) + any Tactics-check Effect from the Captain.
  async rollShipInitiative({ thrustAdvantage = false, tacticsEffect = 0 } = {}) {
    const dm   = (thrustAdvantage ? 1 : 0) + tacticsEffect;
    const roll = await new Roll(`2d6 + ${dm}`).evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:  `<strong>${this.name}</strong> — Ship Initiative (DM${signed(dm)})`,
    });
    return roll;
  }

  // Gunner's Turret/Bay Weapons check vs the range-based difficulty for the
  // weapon's type. `skillLevel`/`dm` are supplied by the caller since ships
  // don't track crew skills themselves.
  async rollShipAttack(componentItem, options = {}) {
    const weaponType = componentItem.system.weaponType;
    if (!weaponType) {
      ui.notifications.warn(`${componentItem.name} is not configured as a weapon.`);
      return null;
    }
    const hits = componentItem.system.hits ?? 0;
    if (hits >= 2) {
      ui.notifications.warn(`${componentItem.name} is disabled and cannot fire.`);
      return null;
    }

    const range = options.range ?? await this._promptRange(options.defaultRange ?? "short");
    if (!range) return null;

    const diffKey = CONFIG.CEPHEUS.spaceCombat.attackDifficulty[weaponType]?.[range];
    if (!diffKey) {
      ui.notifications.warn(`${componentItem.name} cannot fire at that range.`);
      return null;
    }

    const trackingPenalty = hits === 1 ? -2 : 0;
    const skillLevel      = options.skillLevel ?? 0;
    const dm              = options.dm ?? 0;

    const check = await evaluateCheck({ dm: skillLevel + dm + trackingPenalty, difficulty: diffKey });

    const rangeLabel = game.i18n.localize(CONFIG.CEPHEUS.spaceCombat.rangeBands[range]);

    await check.roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: formatCheckFlavor({
        title:   componentItem.name,
        kind:    "Ship Attack",
        detail:  `${rangeLabel} range / ${check.diffLabel} (${check.target}+)${trackingPenalty ? ` / tracking damaged DM${trackingPenalty}` : ""}`,
        outcome: { success: check.success, extra: check.success ? ` (Effect ${signed(check.effect)})` : "" },
      }),
    });
    return { roll: check.roll, success: check.success, effect: check.effect };
  }

  async rollShipWeaponDamage(componentItem) {
    const raw = componentItem.system.damage ?? "";
    if (!isDiceFormula(raw)) {
      ui.notifications.info(`${componentItem.name}: no damage formula set.`);
      return null;
    }
    const roll = await new Roll(normalizeDiceFormula(raw)).evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: formatCheckFlavor({
        title:  componentItem.name,
        kind:   "Weapon Damage",
        detail: `Apply to the target with its "Apply Hit" action (subtracts armor automatically)`,
      }),
    });
    return roll;
  }

  // Resolves a raw (pre-armor) damage total against this ship: subtracts
  // armor, converts the result to a hit count via the Space Combat Damage
  // table, then rolls Hit Location and applies each effect in turn.
  async applyShipDamage(rawDamage, { radiation = false } = {}) {
    const armor     = this.system.armor ?? 0;
    const effective = Math.max(0, rawDamage - armor);

    const lines = [
      `<strong>${this.name}</strong> — Space Combat Damage`,
      `<span class="cepheus-chat-detail">Raw ${rawDamage} − Armor ${armor} = ${effective} effective</span>`,
    ];

    if (effective <= 0) {
      lines.push("No damage.");
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content: lines.join("<br>") });
      return;
    }

    const hits   = damageToHits(effective);
    const events = [
      ...Array(hits.single).fill(1),
      ...Array(hits.double).fill(2),
      ...Array(hits.triple).fill(3),
    ];

    for (const multiplier of events) {
      const locRoll = await new Roll("2d6").evaluate();
      const column  = this.system.isSmallCraft
        ? "smallCraft"
        : (this.system.hullPoints.value > 0 ? "external" : "internal");
      const locationKey = CONFIG.CEPHEUS.spaceCombat.hitLocation[locRoll.total][column];
      const label        = game.i18n.localize(CONFIG.CEPHEUS.spaceCombat.locationLabels[locationKey]);
      const effectText   = await this._resolveShipHitLocation(locationKey, multiplier, { radiation });
      lines.push(`[${locRoll.total}] <strong>${label}</strong>${multiplier > 1 ? ` ×${multiplier}` : ""} — ${effectText}`);
    }

    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content: lines.join("<br>") });
  }

  async _resolveShipHitLocation(locationKey, multiplier, { radiation = false } = {}) {
    const sc = CONFIG.CEPHEUS.spaceCombat;

    if (locationKey === "hull") {
      const hp    = this.system.hullPoints;
      const value = Math.max(0, hp.value - multiplier);
      await this.update({ "system.hullPoints.value": value });
      return `Hull ${value}/${hp.max}` + (value === 0 ? " — hull breached!" : "");
    }

    if (locationKey === "structure") {
      const sp    = this.system.structurePoints;
      const value = Math.max(0, sp.value - multiplier);
      await this.update({ "system.structurePoints.value": value });
      if (value === 0) ui.notifications.error(`${this.name}: structure destroyed!`);
      return `Structure ${value}/${sp.max}` + (value === 0 ? " — ship destroyed!" : "");
    }

    if (locationKey === "armor") {
      const armor = this.system.armor ?? 0;
      if (armor <= 0) return await this._resolveShipHitLocation("hull", multiplier, { radiation });
      const value = Math.max(0, armor - multiplier);
      await this.update({ "system.armor": value });
      return `Armor reduced to ${value}`;
    }

    if (locationKey === "crew") {
      const results = [];
      for (let i = 0; i < multiplier; i++) results.push(await this._rollShipCrewDamage(radiation));
      return results.join("; ");
    }

    if (locationKey === "turret" || locationKey === "bay") {
      return this._applyShipMountHit(locationKey, multiplier, { radiation });
    }

    const def = sc.subsystems[locationKey];
    if (!def) return "No effect.";

    const field   = `${locationKey}Hits`;
    const current = this.system[field] ?? 0;
    const { value, overflow } = applyTieredHit(current, multiplier);
    await this.update({ [`system.${field}`]: value });
    let text = value > 0 ? def.tiers[value - 1] : "No effect.";

    // Power Plant tier 2 and Bridge tier 1 specifically trigger a Crew Hit
    // (radiation/normal respectively) — roll it once, the first time this
    // resolution crosses into that tier.
    if (locationKey === "powerPlant" && current < 2 && value >= 2) {
      text += ` — ${await this._rollShipCrewDamage(true)}`;
    }
    if (locationKey === "bridge" && current < 1 && value >= 1) {
      text += ` — ${await this._rollShipCrewDamage(false)}`;
    }

    // Fuel/Hold tiers actually consume the tracked resource.
    if (locationKey === "fuel" && value >= 3) {
      await this.update({ "system.fuel.value": 0 });
      text += " — all fuel lost";
    } else if (locationKey === "fuel" && value === 2) {
      const pct  = await new Roll("1d6*10").evaluate();
      const lost = Math.round((this.system.fuel.value * pct.total) / 100);
      await this.update({ "system.fuel.value": Math.max(0, this.system.fuel.value - lost) });
      text += ` (${pct.total}%, ${lost}T lost)`;
    }
    if (locationKey === "hold" && value >= 3) {
      await this.update({ "system.cargoUsed": 0 });
      text += " — cargo hold and contents destroyed";
    } else if (locationKey === "hold" && (value === 1 || value === 2)) {
      const pct  = await new Roll("1d6*10").evaluate();
      const lost = Math.round((this.system.cargoUsed * pct.total) / 100);
      await this.update({ "system.cargoUsed": Math.max(0, this.system.cargoUsed - lost) });
      text += ` (${pct.total}%, ${lost}T lost)`;
    }

    if (overflow > 0) {
      const redirected = await this._resolveShipHitLocation(def.subsequent, overflow, { radiation });
      text += ` + overflow → ${game.i18n.localize(sc.locationLabels[def.subsequent])}: ${redirected}`;
    }
    return text;
  }

  async _applyShipMountHit(mount, multiplier, { radiation = false } = {}) {
    const sc  = CONFIG.CEPHEUS.spaceCombat;
    const def = sc.mountHits[mount];
    const candidates = (this.itemTypes.shipComponent ?? [])
      .filter(c => c.system.mount === mount && c.system.weaponType);

    if (!candidates.length) {
      const redirected = await this._resolveShipHitLocation(def.subsequent, multiplier, { radiation });
      return `No ${mount} systems aboard — redirected to ${game.i18n.localize(sc.locationLabels[def.subsequent])}: ${redirected}`;
    }

    const component = candidates[Math.floor(Math.random() * candidates.length)];
    const current    = component.system.hits ?? 0;
    const { value, overflow } = applyTieredHit(current, multiplier);
    await component.update({ "system.hits": value });
    let text = `${component.name}: ${def.tiers[value - 1]}`;

    if (overflow > 0) {
      const redirected = await this._resolveShipHitLocation(def.subsequent, overflow, { radiation });
      text += ` + overflow → ${game.i18n.localize(sc.locationLabels[def.subsequent])}: ${redirected}`;
    }
    return text;
  }

  async _rollShipCrewDamage(radiation) {
    const cd = CONFIG.CEPHEUS.spaceCombat.crewDamage;
    const r  = await new Roll("2d6").evaluate();
    const total = r.total;

    let entry;
    if      (total <= cd.low.max)  entry = cd.low;
    else if (total <= cd.mid.max)  entry = cd.mid;
    else if (total <= cd.high.max) entry = cd.high;
    else if (total === 11)         entry = cd.all1;
    else                            entry = cd.all2;

    if (entry.none) return `Crew Hit [${total}]: lucky escape, no damage`;

    const formula  = radiation ? entry.formula.radiation : entry.formula.normal;
    const dmgRoll  = await new Roll(formula).evaluate();
    const who      = entry.allCrew ? "All crew" : "One random crew member";
    const kind     = radiation ? "rads" : "damage";
    return `Crew Hit [${total}]: ${who} suffers ${dmgRoll.total} ${kind} (GM: apply manually)`;
  }
}
