// GM-facing random tables transcribed from the Cepheus Engine SRD. Unlike the
// augments compendium, these are direct SRD transcriptions (see page refs per
// table), not homebrew content.

// D66 formula: roll 1D6 for the tens digit, 1D6 for the ones digit — gives
// two-digit results from 11 to 66 that skip any digit above 6.
const D66 = "(1d6 * 10) + 1d6";

function textResults(entries) {
  return entries.map(([range, text]) => ({
    type: "text",
    text,
    range: [range, range],
    weight: 1,
  }));
}

// A result that sends the draw to another RollTable in this same pack — for
// chained sub-tables (e.g. Starship Encounters [9] "Hostile Vessel" →
// draw again on a Hostile Vessel Type table). The referenced table's real
// document _id doesn't exist yet at seed-authoring time (it's assigned when
// the pack is first built), so this carries a name-based placeholder in a
// flag; seed-sync.mjs's resolveTableReferences() patches `documentId` once
// every table in the pack has been created.
function tableResults(entries) {
  // entries: [range, subTableName]
  return entries.map(([range, subTableName]) => ({
    type: "pack",
    documentCollection: "cepheus-engine.tables",
    documentId: null,
    text: subTableName,
    range: [range, range],
    weight: 1,
    flags: { "cepheus-engine": { subTableRef: subTableName } },
  }));
}

export const TABLES_SEED = [
  {
    name: "Random Encounters",
    description: "SRD p.187 — Table: Random Encounters (D66).",
    formula: D66,
    replacement: true,
    displayRoll: true,
    results: textResults([
      [11, "Adventurers"], [12, "Alien Starship Crew"], [13, "Ambushing Brigands"],
      [14, "Bandits"], [15, "Beggars"], [16, "Belters"],
      [21, "Drunken Crew"], [22, "Fugitives"], [23, "Government Officials"],
      [24, "Guards"], [25, "Hunters and Guides"], [26, "Law Enforcers on Patrol"],
      [31, "Local Performers"], [32, "Maintenance Robots"], [33, "Merchants"],
      [34, "Military Personnel on Leave"], [35, "Noble with Retinue"], [36, "Peasants"],
      [41, "Political Dissident"], [42, "Potential Patron"], [43, "Public Demonstration"],
      [44, "Religious Pilgrims"], [45, "Reporters"], [46, "Researchers"],
      [51, "Riotous Mob"], [52, "Security Troops"], [53, "Servant Robots"],
      [54, "Soldiers on Patrol"], [55, "Street Vendors"], [56, "Technicians"],
      [61, "Thugs"], [62, "Tourists"], [63, "Traders"],
      [64, "Vigilantes"], [65, "Workers"], [66, "Referee's Choice"],
    ]),
  },
  {
    name: "Patron Encounters",
    description: "SRD p.188 — Table: Patron Encounters (D66).",
    formula: D66,
    replacement: true,
    displayRoll: true,
    results: textResults([
      [11, "Agent"], [12, "Athlete"], [13, "Barbarian"],
      [14, "Belter"], [15, "Broker"], [16, "Bureaucrat"],
      [21, "Celebrity"], [22, "Colonist"], [23, "Con Artist"],
      [24, "Corporate Executive"], [25, "Courier"], [26, "Diplomat"],
      [31, "Drifter"], [32, "Educator"], [33, "Entertainer"],
      [34, "Financier"], [35, "Fugitive"], [36, "Hijacker"],
      [41, "Hunter"], [42, "Marine"], [43, "Mercenary"],
      [44, "Merchant"], [45, "Navy"], [46, "Noble"],
      [51, "Physician"], [52, "Pirate"], [53, "Politician"],
      [54, "Rogue"], [55, "Scientist"], [56, "Scout"],
      [61, "Smuggler"], [62, "System Defense Officer"], [63, "Technician"],
      [64, "Terrorist"], [65, "Tourist"], [66, "Referee's Choice"],
    ]),
  },
  {
    name: "Random Rumor Content",
    description: "SRD p.190-191 — Table: Random Rumor Content (D66).",
    formula: D66,
    replacement: true,
    displayRoll: true,
    results: textResults([
      [11, "Background information"], [12, "Background information"], [13, "Broad background information"],
      [14, "Broad background information"], [15, "Broad background information"], [16, "Completely false information"],
      [21, "General location data"], [22, "General location data"], [23, "General location data"],
      [24, "Helpful data"], [25, "Important fact"], [26, "Information leading to trap"],
      [31, "Library data reference"], [32, "Library data reference (general information)"], [33, "Library data reference (general information)"],
      [34, "Major fact"], [35, "Major fact"], [36, "Minor fact"],
      [41, "Minor fact"], [42, "Misleading background data"], [43, "Misleading background data"],
      [44, "Misleading background information"], [45, "Misleading background information"], [46, "Misleading background information"],
      [51, "Misleading clue"], [52, "Obvious clue"], [53, "Partial (potentially misleading) fact"],
      [54, "Reliable recommendation to action"], [55, "Specific background data"], [56, "Specific background data"],
      [61, "Specific location data"], [62, "Specific location data"], [63, "Terminology"],
      [64, "Veiled clue"], [65, "Veiled clue"], [66, "Referee's Choice"],
    ]),
  },
  {
    name: "Starship Encounters",
    description: "SRD p.193 — Table: Starship Encounters (2D6).",
    formula: "2d6",
    replacement: true,
    displayRoll: true,
    results: textResults([
      [2, "Alien Vessel"], [3, "Derelict"], [4, "Space Habitat"], [5, "Astrogation"],
      [6, "Space Junk"], [7, "Merchant Vessel"], [8, "Personal Vessel"], [9, "Hostile Vessel"],
      [10, "Military Vessel"], [11, "Spacecraft"], [12, "Referee's Choice"],
    ]),
  },
  {
    name: "Animal Encounter (2D6 Template)",
    description: "SRD p.184 — 2D6 Animal Encounter Table Template. \"Event\" results are placeholders for a Referee-created encounter appropriate to the terrain.",
    formula: "2d6",
    replacement: true,
    displayRoll: true,
    results: textResults([
      [2, "Scavenger"], [3, "Omnivore"], [4, "Scavenger"], [5, "Omnivore"],
      [6, "Herbivore"], [7, "Herbivore"], [8, "Herbivore"], [9, "Carnivore"],
      [10, "Event"], [11, "Carnivore"], [12, "Carnivore"],
    ]),
  },
];
