export async function rollCheck({ dm = 0, difficulty = "average", flavor = "", speaker = null } = {}) {
  const diffEntry = CONFIG.CEPHEUS.difficulties[difficulty];
  const target = diffEntry?.target ?? 8;
  const roll = await new Roll(`2d6 + ${dm}`).evaluate();
  const success = roll.total >= target;

  await roll.toMessage({
    speaker: speaker ?? ChatMessage.getSpeaker(),
    flavor: flavor || game.i18n.format("CEPHEUS.RollCheck", {
      difficulty: game.i18n.localize(diffEntry?.label ?? ""),
      target,
    }),
  });

  return { roll, success, total: roll.total, target };
}
