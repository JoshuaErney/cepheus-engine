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

// Display labels for hit-location chat output.
CEPHEUS.spaceCombat.locationLabels = {
  hull: "Hull", structure: "Structure", armor: "Armor", crew: "Crew",
  sensors: "Sensors", mDrive: "M-Drive", jDrive: "J-Drive",
  powerPlant: "Power Plant", bridge: "Bridge", fuel: "Fuel", hold: "Cargo Hold",
  turret: "Turret", bay: "Bay",
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

// Table: Crew Damage (p.161), keyed by 2D6 roll.
CEPHEUS.spaceCombat.crewDamage = {
  low:  { max: 4,  none: true },
  mid:  { max: 8,  allCrew: false, formula: { normal: "2d6", radiation: "2d6*10" } },
  high: { max: 10, allCrew: false, formula: { normal: "4d6", radiation: "4d6*10" } },
  all1: { max: 11, allCrew: true,  formula: { normal: "2d6", radiation: "2d6*10" } },
  all2: { max: 12, allCrew: true,  formula: { normal: "4d6", radiation: "4d6*10" } },
};
