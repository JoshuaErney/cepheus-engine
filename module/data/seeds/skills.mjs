// All skills from the Cepheus Engine SRD "Table: Available Skills" (p.48) plus the
// five Psionic Talents from Chapter 3 (p.58-64).
// characteristic: default linked characteristic for rolls. The SRD explicitly leaves
// characteristic choice to the task/Referee (p.46, "Task Description Format") rather
// than fixing one per skill, so these are sensible defaults, not official values.
// level is always 0 in the compendium — players set actual levels on their character.
//
// Cascade skills (marked "(Cascade Skill)" in the name, matching the SRD) grant one of
// their listed specialties immediately on acquisition — the specialty items below are
// what a character actually ends up holding.

export const SKILLS_SEED = [

  // ── Basic Skills ──────────────────────────────────────────────────────────

  {
    name: "Admin",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Experience with bureaucratic agencies. Used to avoid police harassment, ensure prompt issuance of licenses, or otherwise get a positive outcome when dealing with administrators and bureaucrats.</p>",
    },
  },
  {
    name: "Advocate",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Familiarity with the laws and regulations governing interstellar travel, commerce, and relations. Does not grant knowledge of every world's local laws, nor the right to act as an attorney.</p>",
    },
  },
  {
    name: "Animals (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>Covers different aspects of animal handling. When received, the character must immediately select one of: Farming, Riding, Survival, or Veterinary Medicine.</p>",
    },
  },
  {
    name: "Farming",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>The ability to grow and harvest crops and raise animals, including hydroponic farming and clone harvesting at high tech levels.</p>",
    },
  },
  {
    name: "Riding",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>The ability to maneuver and provide basic routine care for horses and other living creatures trained to bear a rider.</p>",
    },
  },
  {
    name: "Survival",
    type: "skill",
    system: {
      level: 0, characteristic: "end",
      description: "<p>Survival in the wild: hunting or trapping, avoiding exposure, locating food and water, producing fire, finding shelter, and dealing with hazardous climates.</p>",
    },
  },
  {
    name: "Veterinary Medicine",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Medical care and treatment of animals: emergency care, long-term care, and specialized treatment for diseases, poisons, and debilitating injuries.</p>",
    },
  },
  {
    name: "Athletics",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Physical fitness and training: climbing, juggling, throwing, long-distance running, weight-lifting, and other feats of coordination, endurance, or strength.</p>",
    },
  },
  {
    name: "Battle Dress",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Operation of powered battle armor and mechanical exoskeletons. Without this skill, wearing battle dress imposes the usual unskilled penalty to all actions.</p>",
    },
  },
  {
    name: "Bribery",
    type: "skill",
    system: {
      level: 0, characteristic: "soc",
      description: "<p>Experience bribing petty and not-so-petty officials to circumvent regulations or cumbersome laws, with minimum bribe amounts scaling by offense severity.</p>",
    },
  },
  {
    name: "Broker",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>Locating suppliers and buyers and facilitating the purchase and resale of commercial goods, per the Trade and Commerce rules.</p>",
    },
  },
  {
    name: "Carousing",
    type: "skill",
    system: {
      level: 0, characteristic: "soc",
      description: "<p>The interpersonal art of socializing and putting others at ease at parties, balls, bar-hopping, and similar gatherings.</p>",
    },
  },
  {
    name: "Comms",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Use, repair, and maintenance of communications and sensor devices: boosting signals, creating or breaking secure channels, detecting anomalies, jamming, and analyzing sensor data.</p>",
    },
  },
  {
    name: "Computer",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Programming and operation of electronic and fiber-optic computers. Higher levels allow creating or breaking encryption, mining data, and general programming tasks.</p>",
    },
  },
  {
    name: "Demolitions",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>The use of demolition charges and other explosive devices, including assembling or disarming bombs.</p>",
    },
  },
  {
    name: "Electronics",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Installing, using, maintaining, repairing, and creating electronic devices and equipment. Also covers disabling alarm systems and picking electronic locks.</p>",
    },
  },
  {
    name: "Engineering",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Operation and maintenance of starship maneuver drives, Jump drives, and power plants — particularly important for a successful Jump transition.</p>",
    },
  },
  {
    name: "Gambling",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>Knowledge of games of chance, with an advantage over non-experts. Used for both competitive and non-competitive games, and to cheat or detect cheating.</p>",
    },
  },
  {
    name: "Gravitics",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Installing, maintaining, repairing, and creating gravitic devices such as air/raft lift modules, grav belts, grav sleds, and grav tanks. Distinct from Grav Vehicle, which is for piloting them.</p>",
    },
  },
  {
    name: "Jack-of-All-Trades",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Reduces the unskilled penalty by one for every level held. Cannot grant a skill bonus at higher levels — it only offsets the lack of a specific skill.</p>",
    },
  },
  {
    name: "Leadership",
    type: "skill",
    system: {
      level: 0, characteristic: "soc",
      description: "<p>The ability to command and inspire others, coordinate group actions in combat, improve morale, and direct subordinates.</p>",
    },
  },
  {
    name: "Linguistics",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Knowledge of languages beyond the character's native tongue. Also allows deciphering the general meaning of a preserved inscription or recorded message.</p>",
    },
  },
  {
    name: "Liaison",
    type: "skill",
    system: {
      level: 0, characteristic: "soc",
      description: "<p>Dealing with others: proper protocols, manners of address, and codes of conduct. Used to negotiate deals, settle disputes, and influence attitudes.</p>",
    },
  },
  {
    name: "Mechanics",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Installing, using, maintaining, repairing, and creating mechanical devices and equipment. Also covers disabling mechanical alarms and picking mechanical locks.</p>",
    },
  },
  {
    name: "Medicine",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Diagnosis and treatment of injuries and disease: emergency care, long-term care, and specialized treatment. A -2 DM applies when treating a patient of another race.</p>",
    },
  },
  {
    name: "Navigation",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>The science of normal and Jump space navigation: determining a ship's post-Jump location, plotting a course through normal space, and plotting a Jump route.</p>",
    },
  },
  {
    name: "Piloting",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Operation of interplanetary and interstellar spacecraft, necessary to handle such craft in challenging circumstances like rough atmospheric conditions or hostile action.</p>",
    },
  },
  {
    name: "Recon",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>Scouting out dangers and spotting threats, unusual objects, or out-of-place people, while staying unseen and unheard.</p>",
    },
  },
  {
    name: "Sciences (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Covers different scientific disciplines. When received, the character must immediately select one of: Life Sciences, Physical Sciences, Social Sciences, or Space Sciences.</p>",
    },
  },
  {
    name: "Life Sciences",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Theoretical and practical knowledge of living organisms: biochemistry, biology, botany, cybernetics, genetics, physiology, and psionocology.</p>",
    },
  },
  {
    name: "Physical Sciences",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Theoretical and practical knowledge of energy and non-living matter: chemistry, electronics, geology, and physics.</p>",
    },
  },
  {
    name: "Social Sciences",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Theoretical and practical knowledge of sophont society: archaeology, economics, history, philosophy, psychology, and sophontology.</p>",
    },
  },
  {
    name: "Space Sciences",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Theoretical and practical knowledge of interplanetary and interstellar space: astronomy, cosmology, planetology, and xenology.</p>",
    },
  },
  {
    name: "Steward",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Serving and caring for nobles and high-class passengers: concierge duties, housekeeping, meal preparation, personal grooming, and social etiquette.</p>",
    },
  },
  {
    name: "Streetwise",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>Understanding of the urban environment and its power structures: where to go for information, how to handle strangers, and who operates on the fringe of legality.</p>",
    },
  },
  {
    name: "Tactics",
    type: "skill",
    system: {
      level: 0, characteristic: "int",
      description: "<p>Tactical planning and decision-making, from board games to squad-level combat to fleet engagements.</p>",
    },
  },
  {
    name: "Zero-G",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Working and living in micro-gravity and freefall, including combat, and the wearing, care, and maintenance of vacuum suits and combat armor.</p>",
    },
  },

  // ── Weapon Skills ─────────────────────────────────────────────────────────

  {
    name: "Gun Combat (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Covers different types of ranged personal weapons. When received, the character must immediately select one of: Archery, Energy Pistol, Energy Rifle, Shotgun, Slug Pistol, or Slug Rifle.</p>",
    },
  },
  {
    name: "Archery",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Skilled use of bows and crossbows for hunting or combat.</p>",
    },
  },
  {
    name: "Energy Pistol",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Skilled use of advanced pistol-style energy weapons, such as laser pistols and stunners.</p>",
    },
  },
  {
    name: "Energy Rifle",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Skilled use of advanced energy weapons, such as laser rifles or plasma rifles.</p>",
    },
  },
  {
    name: "Shotgun",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Skilled use of shotguns.</p>",
    },
  },
  {
    name: "Slug Pistol",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Skilled use of projectile-based pistols, such as the body pistol or snub pistol.</p>",
    },
  },
  {
    name: "Slug Rifle",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Skilled use of projectile-based rifle weapons, such as the auto rifle or gauss rifle.</p>",
    },
  },
  {
    name: "Gunnery (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Covers different types of devastating weapons used against vehicles, spaceships, and ground installations. When received, the character must immediately select one of: Bay Weapons, Heavy Weapons, Screens, Spinal Mounts, or Turret Weapons.</p>",
    },
  },
  {
    name: "Bay Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Operation of bay weapons aboard a ship.</p>",
    },
  },
  {
    name: "Heavy Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Man-portable and larger weapons that cause extreme property damage, such as rocket launchers, artillery, and plasma weapons.</p>",
    },
  },
  {
    name: "Screens",
    type: "skill",
    system: {
      level: 0, characteristic: "edu",
      description: "<p>Activating and using a ship's energy screens, such as nuclear dampers or meson screens.</p>",
    },
  },
  {
    name: "Spinal Mounts",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Operation of bay or spinal mount weapons aboard a ship, used against other ships, for planetary bombardment, or against stationary targets.</p>",
    },
  },
  {
    name: "Turret Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Operation of turret-mounted weapons aboard a ship.</p>",
    },
  },
  {
    name: "Melee Combat (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "str",
      description: "<p>Covers different types of personal melee combat weapons. When received, the character must immediately select one of: Natural Weapons, Bludgeoning Weapons, Piercing Weapons, or Slashing Weapons.</p>",
    },
  },
  {
    name: "Bludgeoning Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "str",
      description: "<p>Skilled use of bludgeoning weapons, such as clubs, staffs, and improvised blunt instruments, in personal combat.</p>",
    },
  },
  {
    name: "Natural Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "str",
      description: "<p>Skilled use of one's natural weapons in personal combat — among humans, brawling, martial arts, and wrestling.</p>",
    },
  },
  {
    name: "Piercing Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "str",
      description: "<p>Skilled use of piercing and thrusting weapons, such as spears and polearms, in personal combat.</p>",
    },
  },
  {
    name: "Slashing Weapons",
    type: "skill",
    system: {
      level: 0, characteristic: "str",
      description: "<p>Skilled use of cutting and slashing weapons, such as swords and axes, in personal combat.</p>",
    },
  },

  // ── Transport Skills ──────────────────────────────────────────────────────

  {
    name: "Vehicle (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Covers different types of planetary transportation. When received, the character must immediately select one of: Aircraft, Mole, Tracked Vehicle, Watercraft, or Wheeled Vehicle.</p>",
    },
  },
  {
    name: "Aircraft (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Covers different types of flying vehicles. When received, the character must immediately select one of: Grav Vehicle, Rotor Aircraft, or Winged Aircraft.</p>",
    },
  },
  {
    name: "Grav Vehicle",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of air/rafts and other vehicles using gravitic technology, which have theoretically perfect maneuverability and can hover.</p>",
    },
  },
  {
    name: "Rotor Aircraft",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of helicopters, hovercraft, and similar craft, which can hover but may need checks in adverse conditions.</p>",
    },
  },
  {
    name: "Winged Aircraft",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of jets and other lifting-body airplanes, which must keep moving forward or stall.</p>",
    },
  },
  {
    name: "Mole",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of vehicles that move through solid matter using drills or other earth-moving technologies, such as plasma torches or cavitation.</p>",
    },
  },
  {
    name: "Tracked Vehicle",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of tanks and other vehicles that move on tracks.</p>",
    },
  },
  {
    name: "Watercraft (Cascade Skill)",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Covers different types of watercraft and ocean travel. When received, the character must immediately select one of: Motorboats, Ocean Ships, Sailing Ships, or Submarine.</p>",
    },
  },
  {
    name: "Motorboats",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of small motorized watercraft.</p>",
    },
  },
  {
    name: "Ocean Ships",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of large motorized sea-going ships.</p>",
    },
  },
  {
    name: "Sailing Ships",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of wind-driven watercraft.</p>",
    },
  },
  {
    name: "Submarine",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of vehicles that travel underwater.</p>",
    },
  },
  {
    name: "Wheeled Vehicle",
    type: "skill",
    system: {
      level: 0, characteristic: "dex",
      description: "<p>Maneuvering and basic routine maintenance of automobiles and similar wheeled vehicles.</p>",
    },
  },

  // ── Psionic Talents (Chapter 3) ───────────────────────────────────────────
  // costPsi is the cheapest ability's base cost (before range); see each talent's
  // ability table in the SRD for the full cost range.

  {
    name: "Awareness",
    type: "skill",
    system: {
      level: 0, characteristic: "psi", psionic: true, costPsi: 1,
      description: "<p>Control over one's own body: Suspended Animation (3 PSI), Psionically Enhanced Strength/Endurance (1 PSI per point, max +Awareness level), and Regeneration (1 PSI per characteristic point healed). Never has a range — affects only the psion.</p>",
    },
  },
  {
    name: "Clairvoyance",
    type: "skill",
    system: {
      level: 0, characteristic: "psi", psionic: true, costPsi: 1,
      description: "<p>Sensing events at a distance: Sense (1+Range), Clairvoyance (2+Range, remote sight), Clairaudience (2+Range, remote hearing), Clairsentience (3+Range, both). Cannot be sensed by others, even other psions.</p>",
    },
  },
  {
    name: "Telekinesis",
    type: "skill",
    system: {
      level: 0, characteristic: "psi", psionic: true, costPsi: 2,
      description: "<p>Manipulating objects without touching them, from 10 grams (2+Range) up to 1000 kg (10+Range). Items may be thrown as a ranged (thrown) attack, dealing damage from None up to 8D6 depending on mass.</p>",
    },
  },
  {
    name: "Telepathy",
    type: "skill",
    system: {
      level: 0, characteristic: "psi", psionic: true, costPsi: 1,
      description: "<p>Mind-to-mind contact: Life Detection (1+Range), Telempathy (1+Range), Read Surface Thoughts (2+Range), Send Thoughts (2+Range), Probe (4+Range), Assault (8+Range, 2D6+Effect damage). Shield is passive and free but blocks the telepath's own powers while raised.</p>",
    },
  },
  {
    name: "Teleportation",
    type: "skill",
    system: {
      level: 0, characteristic: "psi", psionic: true, costPsi: 0,
      description: "<p>Instantaneous movement to a previously-visited or witnessed location: unclothed (0+Range) up to heavy load (4+Range). Subject to elevation-change and high-speed-vehicle restrictions described in the Psionics chapter.</p>",
    },
  },
];
