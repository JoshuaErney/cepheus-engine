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
