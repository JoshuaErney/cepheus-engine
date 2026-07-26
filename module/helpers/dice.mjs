// The canonical implementation of the core mechanic (2d6 + DM vs difficulty
// target) and its chat presentation. Every check-style roll in the system —
// skill, attack, psionic, ship attack, standalone macro checks — should run
// through evaluateCheck()/formatCheckFlavor() rather than re-implementing the
// sequence.

// ── Dice-string helpers (pure — unit-tested) ────────────────────────────────

// Seed data and user input mix "2D6"/"2d6" casing and stray whitespace.
export function normalizeDiceFormula(raw) {
  return String(raw ?? "").trim().toLowerCase();
}

// Some damage entries are descriptive text (e.g. "By grenade"), not formulas.
export function isDiceFormula(raw) {
  return /\d+d\d+/.test(normalizeDiceFormula(raw));
}

export function signed(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

// ── Check resolution ────────────────────────────────────────────────────────

// Rolls 2d6 + dm against a CEPHEUS.difficulties key. No chat output — callers
// compose the message with formatCheckFlavor().
export async function evaluateCheck({ dm = 0, difficulty = "average" } = {}) {
  const entry  = CONFIG.CEPHEUS.difficulties[difficulty];
  const target = entry?.target ?? 8;
  const roll   = await new Roll(`2d6 + ${dm}`).evaluate();
  return {
    roll,
    target,
    success:   roll.total >= target,
    effect:    roll.total - target,
    diffLabel: game.i18n.localize(entry?.label ?? ""),
  };
}

// ── Chat presentation ───────────────────────────────────────────────────────

// Standard chat-flavor block:
//   <title> — <kind>
//   <detail line>            (muted; omitted if not given)
//   ✔/✘ Success/Failure      (omitted if no outcome given, e.g. damage rolls)
// `outcome` is an evaluateCheck() result (or { success, extra }); `extra` is
// appended inside the result line (e.g. " (Effect +2)").
export function formatCheckFlavor({ title, kind, detail, outcome }) {
  const lines = [`<strong>${title}</strong> — ${kind}`];
  if (detail) lines.push(`<span class="cepheus-chat-detail">${detail}</span>`);
  if (outcome) {
    lines.push(outcome.success
      ? `<span class="cepheus-chat-success">✔ ${game.i18n.localize("CEPHEUS.Success")}${outcome.extra ?? ""}</span>`
      : `<span class="cepheus-chat-fail">✘ ${game.i18n.localize("CEPHEUS.Failure")}${outcome.extra ?? ""}</span>`);
  }
  return lines.join("<br>");
}

// ── Standalone check (macro-friendly) ───────────────────────────────────────

// Full roll-and-post in one call, independent of any actor.
export async function rollCheck({ dm = 0, difficulty = "average", flavor = "", speaker = null } = {}) {
  const check = await evaluateCheck({ dm, difficulty });

  await check.roll.toMessage({
    speaker: speaker ?? ChatMessage.getSpeaker(),
    flavor: flavor || game.i18n.format("CEPHEUS.RollCheck", {
      difficulty: check.diffLabel,
      target: check.target,
    }),
  });

  return { roll: check.roll, success: check.success, total: check.roll.total, target: check.target };
}
