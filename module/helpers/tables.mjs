// Chained RollTable draws. A TableResult of type "pack" pointing at another
// RollTable in the same compendium (seeded via tableResults() in
// seeds/tables.mjs — e.g. Starship Encounters [2] "Alien Vessel Encounter
// Type" -> the Alien Vessel Encounter Type sub-table) is meant to continue
// automatically, per the SRD's own "roll again on the matching sub-table"
// structure (p.192-195). Foundry's own RollTable#draw() has no such behavior
// for "pack" results — it just posts the reference as the drawn result and
// stops — so this wraps it with a follow-up draw. Used by the "Roll on
// Table" macro in place of a bare `table.draw()`.
export async function drawTableChained(table, options = {}) {
  return _drawChained(table, options, new Set());
}

async function _drawChained(table, options, seen) {
  const draw = await table.draw(options);
  seen.add(table.uuid ?? table.id);

  for (const result of draw.results) {
    if (result.type !== "pack" || !result.documentId) continue;
    const pack = game.packs.get(result.documentCollection);
    const subTable = pack ? await pack.getDocument(result.documentId) : null;
    if (!subTable || subTable.documentName !== "RollTable") continue;

    const key = subTable.uuid ?? subTable.id;
    if (seen.has(key)) continue; // guard against an accidental reference cycle
    await _drawChained(subTable, options, seen);
  }

  return draw;
}
