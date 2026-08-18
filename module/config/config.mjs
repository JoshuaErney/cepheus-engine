export const CEPHEUS = {};

CEPHEUS.characteristics = {
  str: "CEPHEUS.CharStr",
  dex: "CEPHEUS.CharDex",
  end: "CEPHEUS.CharEnd",
  int: "CEPHEUS.CharInt",
  edu: "CEPHEUS.CharEdu",
  soc: "CEPHEUS.CharSoc",
  psi: "CEPHEUS.CharPsi",
};

CEPHEUS.characteristicsAbbr = {
  str: "CEPHEUS.CharStrAbbr",
  dex: "CEPHEUS.CharDexAbbr",
  end: "CEPHEUS.CharEndAbbr",
  int: "CEPHEUS.CharIntAbbr",
  edu: "CEPHEUS.CharEduAbbr",
  soc: "CEPHEUS.CharSocAbbr",
  psi: "CEPHEUS.CharPsiAbbr",
};

CEPHEUS.difficulties = {
  easy:          { label: "CEPHEUS.DiffEasy",          target: 4  },
  routine:       { label: "CEPHEUS.DiffRoutine",       target: 6  },
  average:       { label: "CEPHEUS.DiffAverage",       target: 8  },
  difficult:     { label: "CEPHEUS.DiffDifficult",     target: 10 },
  veryDifficult: { label: "CEPHEUS.DiffVeryDifficult", target: 12 },
  formidable:    { label: "CEPHEUS.DiffFormidable",    target: 14 },
};

// DM lookup by characteristic value (index = value, clamped 0–15)
CEPHEUS.dmByValue = [-3, -2, -2, -1, -1, -1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2];

CEPHEUS.behaviorTypes = {
  carnivore:   "CEPHEUS.BehaviorCarnivore",
  herbivore:   "CEPHEUS.BehaviorHerbivore",
  omnivore:    "CEPHEUS.BehaviorOmnivore",
  scavenger:   "CEPHEUS.BehaviorScavenger",
  hijacker:    "CEPHEUS.BehaviorHijacker",
  intermittent: "CEPHEUS.BehaviorIntermittent",
  filter:      "CEPHEUS.BehaviorFilter",
};

// ── Space Combat (SRD Chapter 10, p.148-161) ────────────────────────────────

CEPHEUS.spaceCombat = {};

CEPHEUS.spaceCombat.rangeBands = {
  adjacent: "CEPHEUS.RangeAdjacent",
  close:    "CEPHEUS.RangeClose",
  short:    "CEPHEUS.RangeShort",
  medium:   "CEPHEUS.RangeMedium",
  long:     "CEPHEUS.RangeLong",
  veryLong: "CEPHEUS.RangeVeryLong",
  distant:  "CEPHEUS.RangeDistant",
};

CEPHEUS.spaceCombat.weaponTypes = {
  "":           "CEPHEUS.None",
  pulseLaser:   "CEPHEUS.WeaponPulseLaser",
  beamLaser:    "CEPHEUS.WeaponBeamLaser",
  particleBeam: "CEPHEUS.WeaponParticleBeam",
  fusionGun:    "CEPHEUS.WeaponFusionGun",
  mesonGun:     "CEPHEUS.WeaponMesonGun",
  sandcaster:   "CEPHEUS.WeaponSandcaster",
  missile:      "CEPHEUS.WeaponMissile",
};

// Missile ammunition type (SRD p.130 Table: Missile Types). Orthogonal to
// weaponType — only meaningful when weaponType is "missile". `smart` always
// hits on 8+ (ignores the Effect-based to-hit table) and may re-attack every
// turn until destroyed/jammed/out of fuel; `nuclear` inflicts a bonus
// radiation crew hit, handled the same way existing radiation weapons
// (meson/fusion/particle) already flow through applyShipDamage's `radiation`
// flag — see the note on rollShipMissileImpact for what is/isn't modeled.
CEPHEUS.spaceCombat.missileTypes = {
  standard: { label: "CEPHEUS.MissileStandard", smart: false, nuclear: false },
  smart:    { label: "CEPHEUS.MissileSmart",    smart: true,  nuclear: false },
  nuclear:  { label: "CEPHEUS.MissileNuclear",  smart: false, nuclear: true  },
};

// Screen type (SRD p.131 Table: Screens). Orthogonal to weaponType — screens
// are defensive installations, not weapons. Purely descriptive here; the
// mechanical effect (2D6 + Screens skill damage reduction, and — for nuclear
// dampers — suppressing the automatic radiation hit) is resolved by
// rollShipTriggerScreens() and applied by hand to the next Apply Hit, the
// same manual compose-the-final-number flow already used for Fire Sand.
CEPHEUS.spaceCombat.screenTypes = {
  meson:   { label: "CEPHEUS.ScreenMeson",   counters: ["mesonGun"] },
  nuclear: { label: "CEPHEUS.ScreenNuclear", counters: ["fusionGun", "nuclearMissile"] },
};

CEPHEUS.spaceCombat.mounts = {
  "":     "CEPHEUS.None",
  turret: "CEPHEUS.MountTurret",
  bay:    "CEPHEUS.MountBay",
};

// Table: Space Combat Attack Difficulties by Weapon Type (p.149). Values are
// keys into CEPHEUS.difficulties; null = weapon cannot fire at that range.
CEPHEUS.spaceCombat.attackDifficulty = {
  pulseLaser:   { adjacent: "difficult",     close: "difficult",     short: "average",   medium: "difficult", long: "difficult", veryLong: "veryDifficult", distant: null },
  beamLaser:    { adjacent: "difficult",     close: "difficult",     short: "difficult", medium: "average",   long: "difficult", veryLong: "difficult",     distant: "difficult" },
  particleBeam: { adjacent: "veryDifficult", close: "difficult",     short: "difficult", medium: "difficult", long: "average",   veryLong: "difficult",     distant: "difficult" },
  fusionGun:    { adjacent: "difficult",     close: "difficult",     short: "difficult", medium: "average",   long: "difficult", veryLong: "difficult",     distant: "difficult" },
  mesonGun:     { adjacent: "veryDifficult", close: "veryDifficult", short: "difficult", medium: "difficult", long: "average",   veryLong: "difficult",     distant: "difficult" },
  sandcaster:   { adjacent: "routine",       close: "average",       short: "difficult", medium: null,        long: null,        veryLong: null,            distant: null },
  // Missiles (p.156) aren't listed in the SRD's Attack Difficulties table —
  // only beam weapons and the sandcaster appear there. The missile-specific
  // rules instead gate range via the Missile Launch Range table (no
  // Adjacent/Close use; see missileRangeTurns below) and convert the launch
  // check's Effect into a separate impact to-hit target (see
  // missileToHitTarget() in helpers/spacecombat.mjs), so the launch check
  // itself doesn't need range-scaled difficulty the way beam attacks do.
  // Treated as a flat Average(+0) at every range it can be fired — a
  // documented judgment call, same convention as the damage>44 interpretation
  // in helpers/spacecombat.mjs.
  missile:      { adjacent: null,            close: null,            short: "average",   medium: "average",   long: "average",   veryLong: "average",       distant: "average" },
};

// Table: Space Combat Hit Location (p.159), keyed by 2D6 roll. `external` is
// used while Hull > 0, `internal` once Hull is exhausted, `smallCraft` for
// vessels under 100 tons.
CEPHEUS.spaceCombat.hitLocation = {
  2:  { external: "hull",    internal: "structure", smallCraft: "hull" },
  3:  { external: "sensors", internal: "powerPlant", smallCraft: "powerPlant" },
  4:  { external: "mDrive",  internal: "jDrive",     smallCraft: "hold" },
  5:  { external: "turret",  internal: "bay",        smallCraft: "fuel" },
  6:  { external: "hull",    internal: "structure", smallCraft: "hull" },
  7:  { external: "armor",   internal: "crew",       smallCraft: "armor" },
  8:  { external: "hull",    internal: "structure", smallCraft: "hull" },
  9:  { external: "fuel",    internal: "hold",       smallCraft: "turret" },
  10: { external: "mDrive",  internal: "jDrive",     smallCraft: "mDrive" },
  11: { external: "sensors", internal: "powerPlant", smallCraft: "crew" },
  12: { external: "hull",    internal: "bridge",     smallCraft: "bridge" },
};

// Display labels for hit locations — the single label source for both the
// ship sheet's subsystem rows and hit-resolution chat output. i18n keys,
// localized at point of use, matching rangeBands/weaponTypes/mounts above.
CEPHEUS.spaceCombat.locationLabels = {
  hull:       "CEPHEUS.LocHull",
  structure:  "CEPHEUS.LocStructure",
  armor:      "CEPHEUS.LocArmor",
  crew:       "CEPHEUS.LocCrew",
  sensors:    "CEPHEUS.LocSensors",
  mDrive:     "CEPHEUS.LocMDrive",
  jDrive:     "CEPHEUS.LocJDrive",
  powerPlant: "CEPHEUS.LocPowerPlant",
  bridge:     "CEPHEUS.LocBridge",
  fuel:       "CEPHEUS.LocFuel",
  hold:       "CEPHEUS.LocHold",
  turret:     "CEPHEUS.LocTurret",
  bay:        "CEPHEUS.LocBay",
};

// Ship-level subsystem hit tracks (p.159-161): 3 tiers of effect text, then
// "Subsequent Hits" redirect to Hull or Structure as noted per system.
CEPHEUS.spaceCombat.subsystems = {
  sensors:    { tiers: ["-2 DM to Comms checks using sensors", "Sensors disabled (no sensor Comms checks, no attacks beyond Adjacent)", "Sensors destroyed"], subsequent: "hull" },
  mDrive:     { tiers: ["Thrust reduced by 1", "Thrust reduced by 50%", "Maneuver drive disabled"], subsequent: "hull" },
  jDrive:     { tiers: ["-2 DM to Jump (Engineering) checks", "Jump drive disabled", "Jump drive destroyed"], subsequent: "structure" },
  powerPlant: { tiers: ["Power plant damaged", "Crew Hit (radiation)", "Power plant destroyed — ship disabled"], subsequent: "structure" },
  bridge:     { tiers: ["Crew Hit (normal)", "Bridge disabled — no Pilot/Sensor actions, can't jump, attacks DM-2", "Bridge destroyed"], subsequent: "structure" },
  fuel:       { tiers: ["Fuel leak: 1D6 tons/hour", "Loses 1D6×10% of stored fuel", "Fuel tank destroyed"], subsequent: "structure" },
  hold:       { tiers: ["Loses 1D6×10% of stored cargo", "Loses 1D6×10% of stored cargo", "Cargo hold destroyed"], subsequent: "structure" },
};

// Turret/Bay hit tracks are per-weapon-component, not per-ship (p.159-160).
CEPHEUS.spaceCombat.mountHits = {
  turret: { tiers: ["Tracking damaged: attacks suffer DM-2", "Turret disabled", "Turret destroyed"], subsequent: "hull" },
  bay:    { tiers: ["Targeting damaged: attacks suffer DM-2", "Bay weapon disabled", "Bay weapon destroyed"], subsequent: "structure" },
};

// Table: Missile Launch Range (p.156) — turns until impact by launch range.
// null = missiles cannot be launched at that range.
CEPHEUS.spaceCombat.missileRangeTurns = {
  adjacent: null, close: null, short: 1, medium: 1, long: 1, veryLong: 2, distant: 2,
};

// Table: Crew Damage (p.161), keyed by 2D6 roll.
CEPHEUS.spaceCombat.crewDamage = {
  low:  { max: 4,  none: true },
  mid:  { max: 8,  allCrew: false, formula: { normal: "2d6", radiation: "2d6*10" } },
  high: { max: 10, allCrew: false, formula: { normal: "4d6", radiation: "4d6*10" } },
  all1: { max: 11, allCrew: true,  formula: { normal: "2d6", radiation: "2d6*10" } },
  all2: { max: 12, allCrew: true,  formula: { normal: "4d6", radiation: "4d6*10" } },
};
