import { CAREERS, CAREER_MAP } from "../data/careers.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CepheusChargenApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "cepheus-chargen",
    classes: ["cepheus-engine", "chargen"],
    position: { width: 700, height: 560 },
    window: { resizable: true },
    actions: {
      rollAll:         CepheusChargenApp.#onRollAll,
      rollChar:        CepheusChargenApp.#onRollChar,
      goToCareer:      CepheusChargenApp.#onGoToCareer,
      selectCareer:    CepheusChargenApp.#onSelectCareer,
      enterCareer:     CepheusChargenApp.#onEnterCareer,
      rollSurvival:    CepheusChargenApp.#onRollSurvival,
      pickSkill:       CepheusChargenApp.#onPickSkill,
      rollAdvancement: CepheusChargenApp.#onRollAdvancement,
      rollReenlistment: CepheusChargenApp.#onRollReenlistment,
      nextTerm:        CepheusChargenApp.#onNextTerm,
      endCareer:       CepheusChargenApp.#onEndCareer,
      rollMuster:      CepheusChargenApp.#onRollMuster,
      applyCharacter:  CepheusChargenApp.#onApplyCharacter,
    },
  };

  static PARTS = {
    chargen: {
      template: "systems/cepheus-engine/templates/apps/chargen.hbs",
      scrollable: [""],
    },
  };

  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this._reset();
  }

  get title() {
    return `${game.i18n.localize("CEPHEUS.ChargenTitle")}: ${this.actor.name}`;
  }

  _reset() {
    this.step     = "characteristics";
    this.chars    = { str: 0, dex: 0, end: 0, int: 0, edu: 0, soc: 0 };
    this.career   = null;       // career data object
    this.rank     = 0;
    this.commissioned = false;
    this.termsServed  = 0;
    this.termState    = null;   // { survivalDone, skillsLeft, advanceDone }
    this.gainedSkills = {};     // { skillName: level }
    this.charBonuses  = { str: 0, dex: 0, end: 0, int: 0, edu: 0, soc: 0 };
    this.credits      = 0;
    this.benefits     = [];
    this.musterLeft   = 0;
    this.cashRollsLeft = 3;     // max 3 cash rolls per character
    this.log          = [];
  }

  // ── Context ──────────────────────────────────────────────────────────────

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const charKeys = ["str", "dex", "end", "int", "edu", "soc"];
    const abbr = { str: "STR", dex: "DEX", end: "END", int: "INT", edu: "EDU", soc: "SOC" };

    const charsDisplay = charKeys.map(k => ({
      key:   k,
      abbr:  abbr[k],
      value: this.chars[k],
    }));

    // Skill tables for current term
    let skillTables = {};
    if (this.career && this.termState) {
      const s = this.career.skills;
      skillTables.personal = s.personal.map((e, i) => ({ label: e, idx: i }));
      skillTables.service  = s.service.map((e, i) => ({ label: e, idx: i }));
      // SRD p.29: Advanced Education is gated on EDU 8+; Specialist Skills has no
      // gating condition and is always available alongside Personal Development
      // and Service Skills (it is not restricted to commissioned characters).
      if ((this.chars.edu + (this.charBonuses?.edu ?? 0)) >= 8) {
        skillTables.advanced = s.advanced.map((e, i) => ({ label: e, idx: i }));
      }
      if (s.specialist?.length) {
        skillTables.specialist = s.specialist.map((e, i) => ({ label: e, idx: i }));
      }
    }

    // Reenlistment becomes available once skills are picked and (if the career has an
    // advancement track) the advancement roll has been resolved.
    const readyForReenlistment = !!this.termState &&
      !this.termState.skillsLeft &&
      (!this.career?.advancement || this.termState.advanceDone);

    // Skills summary for review
    const gainedSkillList = Object.entries(this.gainedSkills)
      .map(([name, level]) => ({ name, level }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const finalChars = {};
    for (const k of charKeys) {
      finalChars[k] = { key: k, abbr: abbr[k], value: (this.chars[k] || 0) + (this.charBonuses[k] || 0) };
    }

    return {
      ...ctx,
      actorName: this.actor.name,
      step: this.step,
      selectedCareerId: this.selectedCareerId ?? null,
      careers: CAREERS,
      charsDisplay,
      finalChars,
      career:       this.career,
      rank:         this.rank,
      commissioned: this.commissioned,
      termsServed:  this.termsServed,
      termState:    this.termState,
      skillTables,
      readyForReenlistment,
      gainedSkillList,
      credits:      this.credits,
      pension:      this._computePension(),
      benefits:     this.benefits,
      musterLeft:   this.musterLeft,
      cashRollsLeft: this.cashRollsLeft,
      log:          [...this.log].reverse(),   // newest first
      age:          18 + this.termsServed * 4,
    };
  }

  _addLog(msg) {
    this.log.push(msg);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _charDm(key) {
    const val = (this.chars[key] ?? 0) + (this.charBonuses[key] ?? 0);
    const dm = CONFIG.CEPHEUS.dmByValue[Math.min(15, Math.max(0, val))];
    return dm ?? 0;
  }

  // SRD p.30: 5+ terms in a single career grants Cr10,000/year at 5 terms,
  // +Cr2,000/year for each term beyond that.
  _computePension() {
    return this.termsServed >= 5 ? 10000 + (this.termsServed - 5) * 2000 : 0;
  }

  _applySkillEntry(entry) {
    // "+1 STR" → characteristic bonus; otherwise → skill gain
    const m = entry.match(/^\+(\d+)\s+(\w+)$/);
    if (m) {
      const amt = parseInt(m[1], 10);
      const key = m[2].toLowerCase();
      if (key in this.charBonuses) {
        this.charBonuses[key] = (this.charBonuses[key] ?? 0) + amt;
        this._addLog(`+${amt} ${m[2]}`);
        return;
      }
    }
    // Skill
    this.gainedSkills[entry] = (this.gainedSkills[entry] ?? -1) + 1;
    this._addLog(`Skill: ${entry} ${this.gainedSkills[entry]}`);
  }

  // ── Characteristic actions ────────────────────────────────────────────────

  static async #onRollAll(event, target) {
    const keys = ["str", "dex", "end", "int", "edu", "soc"];
    for (const k of keys) {
      const r = await new Roll("2d6").evaluate();
      this.chars[k] = r.total;
    }
    this._addLog("Rolled characteristics.");
    this.render({ parts: ["chargen"] });
  }

  static async #onRollChar(event, target) {
    const key = target.dataset.char;
    const r   = await new Roll("2d6").evaluate();
    this.chars[key] = r.total;
    this.render({ parts: ["chargen"] });
  }

  static async #onGoToCareer(event, target) {
    // Read any manually-entered characteristic values from the form before advancing
    const form = this.element.querySelector("form");
    if (form) {
      for (const input of form.querySelectorAll("input[data-char]")) {
        const v = parseInt(input.value, 10);
        if (!isNaN(v)) this.chars[input.dataset.char] = Math.max(1, Math.min(15, v));
      }
    }
    if (Object.values(this.chars).some(v => v < 1)) {
      ui.notifications.warn(game.i18n.localize("CEPHEUS.ChargenNeedChars"));
      return;
    }
    this.step = "career";
    this.render({ parts: ["chargen"] });
  }

  // ── Career actions ────────────────────────────────────────────────────────

  static #onSelectCareer(event, target) {
    this.selectedCareerId = target.dataset.career;
    this.render({ parts: ["chargen"] });
  }

  static async #onEnterCareer(event, target) {
    const careerId = this.selectedCareerId;
    const career   = CAREER_MAP[careerId];
    if (!career) return;

    if (!career.qualification) {
      // Drifter — auto-qualify
      this.career = career;
      this._addLog(`Entered: ${career.name} (automatic).`);
    } else {
      const { char, target: tgt } = career.qualification;
      const dm  = this._charDm(char);
      const r   = await new Roll(`2d6 + ${dm}`).evaluate();
      const success = r.total >= tgt;
      const charAbbr = char.toUpperCase();
      this._addLog(`Qualification (${charAbbr} DM${dm >= 0 ? "+" : ""}${dm} vs ${tgt}+): rolled ${r.total} → ${success ? "success" : "failed"}`);
      if (success) {
        this.career = career;
      } else {
        this.career = CAREER_MAP["drifter"];
        this._addLog(`Failed. Forced into Drifter.`);
      }
    }

    // Grant rank-0 skill if any
    const r0skill = this.career.rankSkills?.[0];
    if (r0skill) this._applySkillEntry(r0skill);

    this.step      = "terms";
    this.termsServed = 0;
    this.rank      = 0;
    this._startTerm();
    this.render({ parts: ["chargen"] });
  }

  // ── Term actions ─────────────────────────────────────────────────────────

  _startTerm() {
    this.termState = {
      num:           this.termsServed + 1,
      survivalDone:  false,
      survived:      false,
      // SRD p.29: careers without commission/advancement checks (Athlete, Barbarian,
      // Belter, Drifter, Entertainer, Hunter, Scout) get 2 skill rolls per term instead of 1.
      skillsLeft:    this.career.commission ? 1 : 2,
      advanceDone:   false,
      advanced:      false,
      justCommissioned: false,
      reenlistDone:    false,
      reenlistOutcome: null,   // "forced-continue" | "forced-retire" | "forced-out" | "choice"
    };
  }

  static async #onRollSurvival(event, target) {
    if (this.termState.survivalDone) return;
    const { char, target: tgt } = this.career.survival;
    const dm = this._charDm(char);
    const r  = await new Roll(`2d6 + ${dm}`).evaluate();
    const ok = r.total >= tgt;
    this.termState.survivalDone = true;
    this.termState.survived     = ok;
    this._addLog(`Survival (${char.toUpperCase()} DM${dm >= 0 ? "+" : ""}${dm} vs ${tgt}+): ${r.total} → ${ok ? "survived" : "injured — mustering out"}`);
    if (!ok) {
      // Forced muster-out — count the in-progress term before computing picks
      this.termsServed++;
      this._finishTerms();
    }
    this.render({ parts: ["chargen"] });
  }

  static #onPickSkill(event, target) {
    if (!this.termState.skillsLeft) return;
    const entry = target.dataset.skill;
    this._applySkillEntry(entry);
    this.termState.skillsLeft--;
    this.render({ parts: ["chargen"] });
  }

  static async #onRollAdvancement(event, target) {
    if (this.termState.advanceDone) return;
    this.termState.advanceDone = true;

    // Commission: rolled independently each term before advancement per SRD
    if (!this.commissioned && this.career.commission) {
      const { char: cc, target: ct } = this.career.commission;
      const cdm = this._charDm(cc);
      const cr  = await new Roll(`2d6 + ${cdm}`).evaluate();
      if (cr.total >= ct) {
        this.commissioned = true;
        this.termState.justCommissioned = true;
        this.termState.skillsLeft += 1;  // bonus specialist table pick
        this._addLog(`Commission (${cc.toUpperCase()} DM${cdm >= 0 ? "+" : ""}${cdm} vs ${ct}+): ${cr.total} → Commissioned! Bonus specialist skill pick.`);
      } else {
        this._addLog(`Commission (${cc.toUpperCase()} DM${cdm >= 0 ? "+" : ""}${cdm} vs ${ct}+): ${cr.total} → Not commissioned.`);
      }
    }

    if (this.career.advancement) {
      const { char, target: tgt } = this.career.advancement;
      const dm  = this._charDm(char);
      const r   = await new Roll(`2d6 + ${dm}`).evaluate();
      const ok  = r.total >= tgt;
      this._addLog(`Advancement (${char.toUpperCase()} DM${dm >= 0 ? "+" : ""}${dm} vs ${tgt}+): ${r.total} → ${ok ? "advanced" : "no change"}`);

      if (ok) {
        this.termState.advanced = true;
        this.rank = Math.min(this.rank + 1, 6);
        const rs = this.career.rankSkills?.[this.rank];
        if (rs) { this._addLog(`Rank ${this.rank} skill: ${rs}`); this._applySkillEntry(rs); }
      }
    }
    this.render({ parts: ["chargen"] });
  }

  // SRD p.31 "Reenlistment and Retirement": always rolled at end of term (flat 2D6 vs
  // the career's reenlistment target, no characteristic DM). A natural 12 forces another
  // term regardless of preference or the normal 7-term cap; failure forces muster-out
  // regardless of preference; otherwise the player freely chooses. At 7+ terms served the
  // character must retire unless the natural-12 exception applies.
  static async #onRollReenlistment(event, target) {
    if (this.termState.reenlistDone) return;
    this.termState.reenlistDone = true;

    const tgt = this.career.reenlistment;
    const r   = await new Roll("2d6").evaluate();
    const natTwelve   = r.total === 12;
    const meetsTarget = r.total >= tgt;
    const willBeTerm  = this.termsServed + 1;

    let outcome;
    if (natTwelve)            outcome = "forced-continue";
    else if (willBeTerm >= 7) outcome = "forced-retire";
    else if (!meetsTarget)    outcome = "forced-out";
    else                      outcome = "choice";
    this.termState.reenlistOutcome = outcome;

    const messages = {
      "forced-continue": "rolled a natural 12 — cannot leave, must serve another term!",
      "forced-retire":   `${meetsTarget ? "succeeded" : "failed"} — term limit reached, must retire.`,
      "forced-out":      "failed — cannot reenlist, forced to muster out.",
      "choice":          "succeeded — may reenlist or muster out.",
    };
    this._addLog(`Reenlistment (vs ${tgt}+): ${r.total} → ${messages[outcome]}`);
    this.render({ parts: ["chargen"] });
  }

  static #onNextTerm(event, target) {
    this.termsServed++;
    this._addLog(`Term ${this.termState.num} complete.`);
    const forcedContinue = this.termState.reenlistOutcome === "forced-continue";
    if (this.termsServed >= 7 && !forcedContinue) {
      this._finishTerms();
    } else {
      this._startTerm();
    }
    this.render({ parts: ["chargen"] });
  }

  static #onEndCareer(event, target) {
    this.termsServed++;
    this._addLog(`Mustered out after term ${this.termState.num}.`);
    this._finishTerms();
    this.render({ parts: ["chargen"] });
  }

  _finishTerms() {
    // Mustering-out: 1 pick per term + 1 per rank
    this.musterLeft   = this.termsServed + this.rank;
    this.cashRollsLeft = Math.min(3, this.musterLeft);
    this.step = "musterout";
  }

  // ── Muster out ────────────────────────────────────────────────────────────

  static async #onRollMuster(event, target) {
    if (!this.musterLeft) return;
    const type = target.dataset.type;  // "cash" or "benefit"

    if (type === "cash") {
      if (this.cashRollsLeft <= 0) { ui.notifications.warn("No more cash rolls allowed."); return; }
      this.cashRollsLeft--;
      const r = await new Roll("1d6").evaluate();
      const idx  = r.total - 1;
      const val  = this.career.cash[idx] ?? 0;
      this.credits += val;
      this._addLog(`Cash table roll ${r.total}: Cr${val.toLocaleString()}`);
    } else {
      const r   = await new Roll("1d6").evaluate();
      const idx = r.total - 1;
      const ben = this.career.benefits[idx] ?? "Nothing";
      // If it's a characteristic boost, apply to charBonuses
      const m   = ben.match(/^\+(\d+)\s+(\w+)$/);
      if (m) {
        const key = m[2].toLowerCase();
        if (key in this.charBonuses) {
          this.charBonuses[key] = (this.charBonuses[key] ?? 0) + parseInt(m[1], 10);
        }
      }
      this.benefits.push(ben);
      this._addLog(`Benefits table roll ${r.total}: ${ben}`);
    }
    this.musterLeft--;
    if (this.musterLeft === 0) {
      this.step = "review";
    }
    this.render({ parts: ["chargen"] });
  }

  // ── Apply to actor ────────────────────────────────────────────────────────

  static async #onApplyCharacter(event, target) {
    const actor = this.actor;
    const updates = {};
    const charKeys = ["str", "dex", "end", "int", "edu", "soc"];

    // Apply characteristics
    for (const k of charKeys) {
      const finalVal = Math.max(1, Math.min(15, (this.chars[k] ?? 7) + (this.charBonuses[k] ?? 0)));
      updates[`system.characteristics.${k}.max`]    = finalVal;
      updates[`system.characteristics.${k}.damage`] = 0;
    }

    updates["system.credits"] = this.credits;
    updates["system.age"]     = 18 + this.termsServed * 4;

    const pension = this._computePension();
    updates["system.pension"] = pension;

    updates["system.career"] = this.career?.name ?? "";
    updates["system.terms"]  = this.termsServed;

    // Final Details (SRD p.41) — read directly from the rendered inputs; chargen.hbs
    // has no <form> wrapper, so query this.element by name rather than a "form" descendant.
    const nameInput = this.element.querySelector('[name="finalName"]');
    if (nameInput?.value?.trim()) updates["name"] = nameInput.value.trim();
    updates["system.gender"]        = this.element.querySelector('[name="finalGender"]')?.value ?? "";
    updates["system.appearance"]    = this.element.querySelector('[name="finalAppearance"]')?.value ?? "";
    updates["system.personalGoals"] = this.element.querySelector('[name="finalPersonalGoals"]')?.value ?? "";

    // Career summary in biography
    const rankTitle = this.career?.rankTitles?.[this.rank] ?? "";
    const summary = [
      `<p><strong>Career:</strong> ${this.career?.name ?? "Unknown"} — ${rankTitle} (${this.termsServed} term${this.termsServed !== 1 ? "s" : ""})</p>`,
      pension ? `<p><strong>Retirement Pension:</strong> Cr${pension.toLocaleString()}/year</p>` : "",
      this.benefits.length
        ? `<p><strong>Benefits:</strong> ${this.benefits.join(", ")}</p>`
        : "",
    ].join("");
    updates["system.biography"] = summary;

    await actor.update(updates);

    // Create or update skill items
    const existingSkills = actor.itemTypes.skill;
    const itemsToCreate  = [];
    const itemsToUpdate  = [];

    for (const [name, level] of Object.entries(this.gainedSkills)) {
      const existing = existingSkills.find(s => s.name === name);
      if (existing) {
        const newLevel = (existing.system.level ?? 0) + level + 1;
        itemsToUpdate.push({ _id: existing.id, "system.level": newLevel });
      } else {
        itemsToCreate.push({ name, type: "skill", system: { level, characteristic: "edu" } });
      }
    }

    if (itemsToCreate.length) {
      await actor.createEmbeddedDocuments("Item", itemsToCreate);
    }
    if (itemsToUpdate.length) {
      await actor.updateEmbeddedDocuments("Item", itemsToUpdate);
    }

    ui.notifications.info(
      `${actor.name} generated — ${this.career?.name} ${rankTitle}, ${this.termsServed} terms.`
    );
    this.close();
  }
}
