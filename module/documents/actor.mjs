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
    const difficulty        = options.difficulty ?? "average";
    const char       = this.system.characteristics?.[characteristicKey];
    const skillLevel = skillItem.system.level ?? 0;
    const target      = CONFIG.CEPHEUS.difficulties[difficulty]?.target ?? 8;
    const woundPenalty = this.system.woundPenalty ?? 0;
    const dm          = (char?.dm ?? 0) + skillLevel + woundPenalty;

    const roll    = await new Roll(`2d6 + ${dm}`).evaluate();
    const success = roll.total >= target;
    const diffLabel = game.i18n.localize(CONFIG.CEPHEUS.difficulties[difficulty]?.label);

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:  `${skillItem.name} — ${diffLabel} (${target}+): ${success
        ? game.i18n.localize("CEPHEUS.Success")
        : game.i18n.localize("CEPHEUS.Failure")}`,
    });
    return { roll, success };
  }

  // ── Shared difficulty picker ─────────────────────────────────────────────

  async _promptDifficulty(defaultDifficulty = "average") {
    const { DialogV2 } = foundry.applications.api;
    const opts = Object.entries(CONFIG.CEPHEUS.difficulties)
      .map(([k, v]) =>
        `<option value="${k}" ${k === defaultDifficulty ? "selected" : ""}>${game.i18n.localize(v.label)}</option>`
      )
      .join("");
    return DialogV2.prompt({
      window: { title: game.i18n.localize("CEPHEUS.SelectDifficulty") },
      content: `<div class="form-group"><label>${game.i18n.localize("CEPHEUS.SelectDifficulty")}</label><select name="difficulty">${opts}</select></div>`,
      ok: { label: game.i18n.localize("CEPHEUS.RollAttack"), callback: (e, btn) => btn.form.elements.difficulty.value },
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

    const target      = CONFIG.CEPHEUS.difficulties[difficulty]?.target ?? 8;

    const totalDm = skillLevel + charDm + woundPenalty;
    const roll    = await new Roll(`2d6 + ${totalDm}`).evaluate();
    const success = roll.total >= target;

    const charLabel  = game.i18n.localize(CONFIG.CEPHEUS.characteristics[charKey] ?? "");
    const diffLabel  = game.i18n.localize(CONFIG.CEPHEUS.difficulties[difficulty]?.label ?? "");
    const skillTag   = skillLevel < 0
      ? `${skillName} (unskilled ${skillLevel})`
      : `${skillName} ${skillLevel}`;
    const sign       = charDm >= 0 ? `+${charDm}` : `${charDm}`;

    const flavor = [
      `<strong>${weaponItem.name}</strong> — Attack Roll`,
      `<span style="font-size:0.85em;color:#aaa">${skillTag} / ${charLabel} DM${sign} / ${diffLabel} (${target}+)</span>`,
      success
        ? `<span style="color:#4caf50">✔ ${game.i18n.localize("CEPHEUS.Success")}</span>`
        : `<span style="color:#f44336">✘ ${game.i18n.localize("CEPHEUS.Failure")}</span>`,
    ].join("<br>");

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor,
    });

    return { roll, success };
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

    const target      = CONFIG.CEPHEUS.difficulties[difficulty]?.target ?? 8;
    const skillLevel  = skillItem.system.level ?? 0;
    const woundPenalty = this.system.woundPenalty ?? 0;
    const totalDm     = skillLevel + psi.dm + woundPenalty;
    const sign       = psi.dm >= 0 ? `+${psi.dm}` : `${psi.dm}`;
    const diffLabel  = game.i18n.localize(CONFIG.CEPHEUS.difficulties[difficulty]?.label);

    const roll    = await new Roll(`2d6 + ${totalDm}`).evaluate();
    const success = roll.total >= target;

    const flavor = [
      `<strong>${skillItem.name}</strong> — Psionic Roll`,
      `<span style="font-size:0.85em;color:#aaa">PSI DM${sign} + Skill ${skillLevel} / Cost: ${cost} PSI / ${diffLabel} (${target}+)</span>`,
      success
        ? `<span style="color:#4caf50">✔ ${game.i18n.localize("CEPHEUS.Success")}</span>`
        : `<span style="color:#f44336">✘ ${game.i18n.localize("CEPHEUS.Failure")}</span>`,
    ].join("<br>");

    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this }), flavor });
    return { roll, success };
  }

  async recoverPsi(amount) {
    const psi = this.system.psi;
    if (!psi) return;
    const recovered = Math.min(amount, psi.damage);
    if (recovered > 0) await this.update({ "system.psi.damage": psi.damage - recovered });
  }

  // ── Damage rolls ─────────────────────────────────────────────────────────

  async rollDamage(weaponItem) {
    const raw     = weaponItem.system.damage ?? "2D6";
    const formula = raw.toLowerCase();

    // Some damage entries are descriptive (e.g. "By grenade") — bail out gracefully.
    if (!/\d+d\d+/.test(formula)) {
      ui.notifications.info(`${weaponItem.name}: ${raw}`);
      return null;
    }

    const roll = await new Roll(formula).evaluate();

    const flavor = [
      `<strong>${weaponItem.name}</strong> — Damage`,
      `<span style="font-size:0.85em;color:#aaa">Roll damage then subtract target's armor</span>`,
    ].join("<br>");

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor,
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
}
