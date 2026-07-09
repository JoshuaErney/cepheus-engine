// Shared by any TypeDataModel with a `characteristics` SchemaField (humanoid
// or creature) — derives current/value/dm/isDamaged/isDown per characteristic.
export function computeCharacteristicDerived(characteristics) {
  const table = CONFIG.CEPHEUS.dmByValue;
  for (const char of Object.values(characteristics)) {
    char.current = Math.max(0, char.max - char.damage);
    char.value   = char.current; // alias: Foundry token bar reads .value
    char.dm = table[Math.clamp(char.current, 0, table.length - 1)];
    char.isDamaged = char.damage > 0;
    char.isDown = char.current === 0;
  }
}

// Shared wound-state table (SRD): STR/DEX/END-based. 3 down = dead; 2 down +
// END=0 = dead; 2 down = mortally; 1 down = seriously; any damage = lightly.
export function computeWoundState(characteristics) {
  const phys = ["str", "dex", "end"];
  const downCount  = phys.filter(k => characteristics[k]?.current === 0).length;
  const anyDamaged = Object.values(characteristics).some(c => c.damage > 0);
  const endDown    = characteristics.end?.current === 0;

  let woundState;
  if      (downCount >= 3)             woundState = "dead";
  else if (downCount === 2 && endDown) woundState = "dead";    // END=0 while seriously wounded
  else if (downCount === 2)            woundState = "mortally";
  else if (downCount === 1)            woundState = "seriously";
  else if (anyDamaged)                 woundState = "lightly";
  else                                  woundState = "healthy";

  let woundPenalty;
  if      (woundState === "lightly")                                woundPenalty = -1;
  else if (woundState === "seriously" || woundState === "mortally") woundPenalty = -2;
  else                                                               woundPenalty = 0;

  return { woundState, woundPenalty };
}
