// Table: Space Combat Damage (SRD p.159). Converts a raw damage total (after
// subtracting the target's armor) into a count of single/double/triple hits.
// A double hit rolls hit location once and applies the effect twice to that
// location; a triple hit applies it three times.
export function damageToHits(damage) {
  if (damage <= 0)  return { single: 0, double: 0, triple: 0 };
  if (damage <= 4)  return { single: 1, double: 0, triple: 0 };
  if (damage <= 8)  return { single: 2, double: 0, triple: 0 };
  if (damage <= 12) return { single: 0, double: 1, triple: 0 };
  if (damage <= 16) return { single: 3, double: 0, triple: 0 };
  if (damage <= 20) return { single: 2, double: 1, triple: 0 };
  if (damage <= 24) return { single: 0, double: 2, triple: 0 };
  if (damage <= 28) return { single: 0, double: 0, triple: 1 };
  if (damage <= 32) return { single: 1, double: 0, triple: 1 };
  if (damage <= 36) return { single: 0, double: 1, triple: 1 };
  if (damage <= 40) return { single: 1, double: 1, triple: 1 };
  if (damage <= 44) return { single: 0, double: 0, triple: 2 };
  // The SRD's text past this point ("for every extra 3 points +1 Single Hit,
  // for every extra 6 points +1 Double Hit") is ambiguous about compounding.
  // Interpreted here as both increments applying independently on top of the
  // 41-44 baseline (2 Triple Hits) — an edge case rarely reached in play.
  const extra = damage - 44;
  return { single: Math.floor(extra / 3), double: Math.floor(extra / 6), triple: 2 };
}

// Applies `amount` hits to a 0-3 tier track (subsystem/turret/bay damage),
// returning the new value and any overflow beyond tier 3, which the SRD
// redirects to Hull or Structure damage ("Subsequent Hits: Count as X hits").
export function applyTieredHit(current, amount, max = 3) {
  const applied  = Math.min(amount, Math.max(0, max - current));
  const overflow = amount - applied;
  return { value: current + applied, overflow };
}
