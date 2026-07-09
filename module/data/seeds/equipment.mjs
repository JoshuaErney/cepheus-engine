// All general equipment from the Cepheus Engine SRD (Chapter 4: Equipment).
// Armor and Weapons are handled in separate seed files.
//
// Notes on data fidelity:
// - Every tl/cost value below is transcribed directly from the SRD tables.
// - Where the SRD table gives no weight for an item (blank or "--"), mass is
//   recorded as 0 and the description notes that the weight is negligible or
//   unspecified, rather than inventing a figure.
// - The Vehicles table in the SRD gives Cost (in KCr) and performance stats
//   (Agility/Speed/Crew/Armor/Hull/Structure) but no vehicle mass/tonnage
//   figure, so mass is 0 for all Vehicles entries; cargo capacity (where the
//   SRD prose gives one) is mentioned in the description instead.
// - The Robots and Drones stat blocks give TL and Price but no physical mass,
//   so mass is 0 there as well; their Strength/Dexterity/Hull/Structure combat
//   stats are summarized in prose since this schema has no fields for them.

export const EQUIPMENT_SEED = [

  // ── Communicators ────────────────────────────────────────────────────────

  {
    name: "Long Range Communicator",
    type: "equipment",
    system: {
      tl: 6, cost: 500, mass: 15,
      description: "<p>Backpack-mounted radio with ten channels, capable of ranges up to 500 km and contact with ships in orbit. At TL7 weight drops to 1.5 kg and it becomes belt or sling mounted.</p>",
    },
  },
  {
    name: "Medium Range Communicator",
    type: "equipment",
    system: {
      tl: 5, cost: 200, mass: 10,
      description: "<p>Belt-mounted or sling-carried radio set with five channels, capable of up to 30 km range and contact with official radio channels. At TL7 weight drops to 0.5 kg.</p>",
    },
  },
  {
    name: "Short Range Communicator",
    type: "equipment",
    system: {
      tl: 5, cost: 100, mass: 5,
      description: "<p>Belt-mounted radio with three channels, capable of 10 km range (much shorter underground or underwater). At TL7 weight drops to 0.3 kg and it becomes hand-held.</p>",
    },
  },
  {
    name: "Personal Communicator",
    type: "equipment",
    system: {
      tl: 8, cost: 250, mass: 0.3,
      description: "<p>A hand-held, single-channel communicator. On worlds of TL8+ it can tap into the local satellite network to reach any other communicator on the world (for a fee), on a private but unsecured channel. Does not function on worlds of TL7 or lower.</p>",
    },
  },

  // ── Computers ────────────────────────────────────────────────────────────

  {
    name: "Computer Terminal",
    type: "equipment",
    system: {
      tl: 7, cost: 200, mass: 0,
      description: "<p>A 'dumb terminal' with only limited processing power of its own (Model 0), serving as an interface to a more powerful computer such as a ship's computer or planetary network. Size varies with control method; the SRD gives no fixed weight.</p>",
    },
  },
  {
    name: "Computer, Model 0 (TL7)",
    type: "equipment",
    system: {
      tl: 7, cost: 50, mass: 10,
      description: "<p>A laptop-sized Model 0 computer, capable of running Rating 0 software. Battery life is roughly two hours at TL7.</p>",
    },
  },
  {
    name: "Computer, Model 1 (TL8)",
    type: "equipment",
    system: {
      tl: 8, cost: 100, mass: 5,
      description: "<p>A laptop-sized Model 1 computer, capable of running Rating 1 software. Battery life is roughly eight hours at TL8.</p>",
    },
  },
  {
    name: "Computer, Model 1 (TL9)",
    type: "equipment",
    system: {
      tl: 9, cost: 250, mass: 5,
      description: "<p>A laptop-sized Model 1 computer, capable of running Rating 1 software. Storage is effectively unlimited and battery life effectively unlimited from TL9 onward.</p>",
    },
  },
  {
    name: "Computer, Model 2 (TL10)",
    type: "equipment",
    system: {
      tl: 10, cost: 350, mass: 1,
      description: "<p>A laptop-sized Model 2 computer, capable of running Rating 2 software. Storage and battery life are effectively unlimited.</p>",
    },
  },
  {
    name: "Computer, Model 2 (TL11)",
    type: "equipment",
    system: {
      tl: 11, cost: 500, mass: 1,
      description: "<p>A laptop-sized Model 2 computer, capable of running Rating 2 software. Storage and battery life are effectively unlimited.</p>",
    },
  },
  {
    name: "Computer, Model 3 (TL12)",
    type: "equipment",
    system: {
      tl: 12, cost: 1000, mass: 0.5,
      description: "<p>A laptop-sized Model 3 computer, capable of running Rating 3 software. Storage and battery life are effectively unlimited.</p>",
    },
  },
  {
    name: "Computer, Model 4 (TL13)",
    type: "equipment",
    system: {
      tl: 13, cost: 1500, mass: 0.5,
      description: "<p>A laptop-sized Model 4 computer, capable of running Rating 4 software. Storage and battery life are effectively unlimited.</p>",
    },
  },
  {
    name: "Computer, Model 5 (TL14)",
    type: "equipment",
    system: {
      tl: 14, cost: 5000, mass: 0.5,
      description: "<p>A laptop-sized Model 5 computer, capable of running Rating 5 software. Storage and battery life are effectively unlimited.</p>",
    },
  },
  {
    name: "Data Display/Recorder (DD/R)",
    type: "equipment",
    system: {
      tl: 13, cost: 5000, mass: 0,
      description: "<p>A headpiece worn over one or both eyes, providing a continuous heads-up display of data from any linked system (computer, vacc suit oxygen reserves, grav belt status, neural activity scanner, etc.) without obscuring vision. The SRD gives no fixed weight.</p>",
    },
  },
  {
    name: "Data Wafer",
    type: "equipment",
    system: {
      tl: 10, cost: 5, mass: 0,
      description: "<p>The principal medium of information storage: a rectangle of hardened plastic about the size of a credit card. A TL10 wafer is memory diamond, encoding data in structures of carbon atoms; more advanced wafers use more exotic storage means. Negligible weight.</p>",
    },
  },

  // ── Computer Software ───────────────────────────────────────────────────

  {
    name: "Software: Database",
    type: "equipment",
    system: {
      tl: 7, cost: 10, mass: 0,
      description: "<p>A large store of information on a topic, searchable with a Computer check or an Agent program. Cost ranges from Cr10 for a narrow topic up to Cr10,000 for an exhaustive database, depending on scope and rarity.</p>",
    },
  },
  {
    name: "Software: Interface/0",
    type: "equipment",
    system: {
      tl: 7, cost: 0, mass: 0,
      description: "<p>Displays computer data. Included free with every computer; using a computer without an interface program is a Formidable (-6 DM) task.</p>",
    },
  },
  {
    name: "Software: Security/0",
    type: "equipment",
    system: {
      tl: 7, cost: 0, mass: 0,
      description: "<p>Defends a system against intrusion. Rating 0 is included free with every computer and sets the intrusion difficulty at Average (+0 DM).</p>",
    },
  },
  {
    name: "Software: Security/1",
    type: "equipment",
    system: {
      tl: 9, cost: 200, mass: 0,
      description: "<p>Defends a system against intrusion, raising the difficulty of unauthorized access to Difficult (-2 DM).</p>",
    },
  },
  {
    name: "Software: Security/2",
    type: "equipment",
    system: {
      tl: 11, cost: 1000, mass: 0,
      description: "<p>Defends a system against intrusion, raising the difficulty of unauthorized access to Very Difficult (-4 DM).</p>",
    },
  },
  {
    name: "Software: Security/3",
    type: "equipment",
    system: {
      tl: 12, cost: 20000, mass: 0,
      description: "<p>Defends a system against intrusion, raising the difficulty of unauthorized access to Formidable (-6 DM).</p>",
    },
  },
  {
    name: "Software: Translator/0",
    type: "equipment",
    system: {
      tl: 9, cost: 50, mass: 0,
      description: "<p>A specialized Expert system with only Language skills, providing near-real-time translation.</p>",
    },
  },
  {
    name: "Software: Translator/1",
    type: "equipment",
    system: {
      tl: 10, cost: 500, mass: 0,
      description: "<p>An improved translator program that works in true real-time and has a much better grasp of linguistic nuance.</p>",
    },
  },
  {
    name: "Software: Intrusion/1",
    type: "equipment",
    system: {
      tl: 10, cost: 1000, mass: 0,
      description: "<p>Aids hacking attempts, granting a DM bonus equal to its Rating. Intrusion software is often illegal.</p>",
    },
  },
  {
    name: "Software: Intrusion/2",
    type: "equipment",
    system: {
      tl: 11, cost: 10000, mass: 0,
      description: "<p>Aids hacking attempts, granting a DM bonus equal to its Rating. Intrusion software is often illegal.</p>",
    },
  },
  {
    name: "Software: Intrusion/3",
    type: "equipment",
    system: {
      tl: 13, cost: 100000, mass: 0,
      description: "<p>Aids hacking attempts, granting a DM bonus equal to its Rating. Intrusion software is often illegal. A Rating 4 version exists at TL15 but is not normally available for purchase.</p>",
    },
  },
  {
    name: "Software: Intelligent Interface/1",
    type: "equipment",
    system: {
      tl: 11, cost: 100, mass: 0,
      description: "<p>'Low autonomous' artificial intelligence allowing voice control and intelligent data display. Required to run Expert programs.</p>",
    },
  },
  {
    name: "Software: Intelligent Interface/2",
    type: "equipment",
    system: {
      tl: 13, cost: 1000, mass: 0,
      description: "<p>'High autonomous' artificial intelligence, primitive enough to self-initiate and learn on its own.</p>",
    },
  },
  {
    name: "Software: Intelligent Interface/3",
    type: "equipment",
    system: {
      tl: 17, cost: 10000, mass: 0,
      description: "<p>True artificial intelligence, capable of independent creative thought.</p>",
    },
  },
  {
    name: "Software: Expert/1",
    type: "equipment",
    system: {
      tl: 11, cost: 1000, mass: 0,
      description: "<p>Mimics a skill. A character using an Expert program may make an Intelligence- or Education-based skill check as if he had the skill at the program's Rating minus 1; if he already has the skill at a higher level, it grants +1 DM instead.</p>",
    },
  },
  {
    name: "Software: Expert/2",
    type: "equipment",
    system: {
      tl: 12, cost: 10000, mass: 0,
      description: "<p>Mimics a skill. A character using an Expert program may make an Intelligence- or Education-based skill check as if he had the skill at the program's Rating minus 1; if he already has the skill at a higher level, it grants +1 DM instead.</p>",
    },
  },
  {
    name: "Software: Expert/3",
    type: "equipment",
    system: {
      tl: 13, cost: 100000, mass: 0,
      description: "<p>Mimics a skill. A character using an Expert program may make an Intelligence- or Education-based skill check as if he had the skill at the program's Rating minus 1; if he already has the skill at a higher level, it grants +1 DM instead.</p>",
    },
  },
  {
    name: "Software: Agent/0",
    type: "equipment",
    system: {
      tl: 11, cost: 500, mass: 0,
      description: "<p>Has a Computer skill equal to its Rating and can carry out assigned tasks with a modicum of intelligence, effectively combining Computer Expert and Intellect programs.</p>",
    },
  },
  {
    name: "Software: Agent/1",
    type: "equipment",
    system: {
      tl: 12, cost: 2000, mass: 0,
      description: "<p>Has a Computer skill equal to its Rating and can carry out assigned tasks with a modicum of intelligence, effectively combining Computer Expert and Intellect programs.</p>",
    },
  },
  {
    name: "Software: Agent/2",
    type: "equipment",
    system: {
      tl: 13, cost: 100000, mass: 0,
      description: "<p>Has a Computer skill equal to its Rating and can carry out assigned tasks with a modicum of intelligence, effectively combining Computer Expert and Intellect programs.</p>",
    },
  },
  {
    name: "Software: Agent/3",
    type: "equipment",
    system: {
      tl: 14, cost: 250000, mass: 0,
      description: "<p>Has a Computer skill equal to its Rating and can carry out assigned tasks with a modicum of intelligence, effectively combining Computer Expert and Intellect programs.</p>",
    },
  },
  {
    name: "Software: Intellect/1",
    type: "equipment",
    system: {
      tl: 12, cost: 2000, mass: 0,
      description: "<p>An improved Agent program that can use Expert systems, running a number of skills simultaneously equal to its Rating. For example, a robot doctor might run Intellect/1 and Expert Medic/3, giving it Medic-2.</p>",
    },
  },
  {
    name: "Software: Intellect/2",
    type: "equipment",
    system: {
      tl: 13, cost: 50000, mass: 0,
      description: "<p>An improved Agent program that can use Expert systems, running a number of skills simultaneously equal to its Rating. Rating 3+ versions exist at TL14 but are not normally available for purchase.</p>",
    },
  },

  // ── Drugs ────────────────────────────────────────────────────────────────

  {
    name: "Medicinal Drugs",
    type: "equipment",
    system: {
      tl: 5, cost: 5, mass: 0,
      description: "<p>Vaccines, antitoxins and antibiotics. Cost ranges from Cr5 up to 1D6×1,000 Credits depending on rarity and complexity. Require the Medic skill to use properly; a successful Medic check lets the correct drug counteract most poisons or diseases. Weight is negligible.</p>",
    },
  },
  {
    name: "Anti-Radiation Drugs",
    type: "equipment",
    system: {
      tl: 8, cost: 1000, mass: 0,
      description: "<p>Absorb up to 100 rads per dose if administered within ten minutes of radiation exposure. May only be used once per day; further doses cause 1D6 permanent Endurance damage each. Weight is negligible.</p>",
    },
  },
  {
    name: "Panaceas",
    type: "equipment",
    system: {
      tl: 8, cost: 200, mass: 0,
      description: "<p>Wide-spectrum medicinal drugs designed not to interact harmfully, usable on any wound or illness. A character using panaceas may make a Medic check as if he had Medic-0 when treating an infection or disease. Weight is negligible.</p>",
    },
  },
  {
    name: "Stim Drugs",
    type: "equipment",
    system: {
      tl: 8, cost: 50, mass: 0,
      description: "<p>Removes fatigue at a cost: the user suffers one point of damage, and the damage doubles (then triples, etc.) each subsequent use without an intervening period of sleep. Weight is negligible.</p>",
    },
  },
  {
    name: "Combat Drug",
    type: "equipment",
    system: {
      tl: 10, cost: 1000, mass: 0,
      description: "<p>Increases reaction time and pain tolerance: +4 to initiative, one free dodge per round, and -2 to all damage suffered, kicking in after four rounds and lasting about ten minutes. The user is fatigued when it wears off. Weight is negligible.</p>",
    },
  },
  {
    name: "Fast Drug",
    type: "equipment",
    system: {
      tl: 10, cost: 200, mass: 0,
      description: "<p>Also called 'Hibernation'. Slows the user's metabolism to a 60:1 ratio (a subjective day is two months), used to stretch life support reserves or as a cheap substitute for a cryoberth. Weight is negligible.</p>",
    },
  },
  {
    name: "Metabolic Accelerator",
    type: "equipment",
    system: {
      tl: 10, cost: 500, mass: 0,
      description: "<p>Also known as 'Slow Drug'. Boosts reaction time to superhuman levels: +8 to initiative and up to two free dodges per round, kicking in after eight rounds and lasting about ten minutes. When it wears off the user's system crashes, suffering 2D6 damage and becoming exhausted. Weight is negligible.</p>",
    },
  },
  {
    name: "Medicinal Slow Drug",
    type: "equipment",
    system: {
      tl: 11, cost: 500, mass: 0,
      description: "<p>A medical variant of slow drug that increases metabolism roughly thirtyfold, allowing a patient to undergo a month of healing in a single day. Safe only in a medical facility with life-support and cryo-technology available. Weight is negligible.</p>",
    },
  },
  {
    name: "Anagathics",
    type: "equipment",
    system: {
      tl: 15, cost: 2000, mass: 0,
      description: "<p>Life-extension drugs; one dose must be taken every month to prevent aging. Missing a dose forces an immediate roll on the aging table. Illegal or heavily controlled on many worlds. Weight is negligible.</p>",
    },
  },

  // ── Explosives ───────────────────────────────────────────────────────────

  {
    name: "Plastic Explosive",
    type: "equipment",
    system: {
      tl: 6, cost: 200, mass: 0,
      description: "<p>A generic, multi-purpose plastic explosive favored by military units, terrorists, demolition teams and adventurers alike. Deals 3D6 damage in a 2D6-meter radius (Demolitions check Effect multiplies damage, minimum ×1). The SRD gives no weight for a standard charge.</p>",
    },
  },
  {
    name: "Pocket Nuke",
    type: "equipment",
    system: {
      tl: 12, cost: 20000, mass: 0,
      description: "<p>A briefcase-sized tactical nuclear device, too large to fit into a grenade launcher and hideously illegal on many worlds. Deals 2D6×20 damage in a 15D6-meter radius. The SRD gives no weight figure.</p>",
    },
  },
  {
    name: "TDX",
    type: "equipment",
    system: {
      tl: 12, cost: 1000, mass: 0,
      description: "<p>An advanced gravity-polarized explosive that detonates only along the horizontal axis. Deals 4D6 damage in a 4D6-meter radius. The SRD gives no weight figure.</p>",
    },
  },

  // ── Personal Devices ─────────────────────────────────────────────────────

  {
    name: "Magnetic Compass",
    type: "equipment",
    system: {
      tl: 3, cost: 10, mass: 0,
      description: "<p>Indicates the direction of magnetic north, if any exists. Negligible weight.</p>",
    },
  },
  {
    name: "Wrist Watch",
    type: "equipment",
    system: {
      tl: 4, cost: 100, mass: 0,
      description: "<p>Allows the user to tell time. At TL9 it can be configured to multiple worlds' time as well as standard time, with configurable alarms. Negligible weight.</p>",
    },
  },
  {
    name: "Radiation Counter",
    type: "equipment",
    system: {
      tl: 5, cost: 250, mass: 1,
      description: "<p>Indicates the presence and intensity of radioactivity within a 30-meter radius; the signal grows stronger closer to the source.</p>",
    },
  },
  {
    name: "Metal Detector",
    type: "equipment",
    system: {
      tl: 6, cost: 300, mass: 1,
      description: "<p>Indicates the presence of metal within a 3-meter radius, including underground, with the signal growing stronger closer to the source.</p>",
    },
  },
  {
    name: "Hand Calculator",
    type: "equipment",
    system: {
      tl: 7, cost: 10, mass: 0.1,
      description: "<p>Allows the user to perform mathematical calculations quickly.</p>",
    },
  },
  {
    name: "Inertial Locator",
    type: "equipment",
    system: {
      tl: 9, cost: 1200, mass: 1.5,
      description: "<p>Indicates direction and distance traveled from the user's starting location.</p>",
    },
  },
  {
    name: "Electromagnetic Probe",
    type: "equipment",
    system: {
      tl: 10, cost: 1000, mass: 0,
      description: "<p>Detects the electromagnetic emissions of technological devices, granting +1 DM when used as a diagnostic tool or to search for hidden bugs or devices (with a Comms check). Negligible weight.</p>",
    },
  },
  {
    name: "Hand Computer",
    type: "equipment",
    system: {
      tl: 11, cost: 1000, mass: 0.5,
      description: "<p>The 'handcomp' provides the services of a small computer and can also serve as a terminal for a standard computer when linked by radio, network jack, or other circuit.</p>",
    },
  },
  {
    name: "Holographic Projector",
    type: "equipment",
    system: {
      tl: 11, cost: 1000, mass: 1,
      description: "<p>A toaster-sized box that projects a three-dimensional image (with limited pre-programmed animation and sound) in a roughly 3-meter radius. Mostly used for communication, as the projections are obviously not real. A TL12 version (double cost) can fool an Intelligence check on first sight; a TL13 version (ten times cost) produces true-to-life images.</p>",
    },
  },
  {
    name: "Densitometer",
    type: "equipment",
    system: {
      tl: 14, cost: 20000, mass: 5,
      description: "<p>Uses an object's natural gravity to measure its density, building a three-dimensional image of its interior and exterior. Useful for salvage, archaeology, and locating hidden compartments.</p>",
    },
  },
  {
    name: "Bioscanner",
    type: "equipment",
    system: {
      tl: 15, cost: 350000, mass: 3.5,
      description: "<p>'Sniffs' for organic molecules and tests chemical samples, detecting poisons or bacteria, analysing organic matter, searching for life signs, and classifying unfamiliar organisms. Data is interpreted with the Comms or Life Sciences skill.</p>",
    },
  },
  {
    name: "Neural Activity Sensor",
    type: "equipment",
    system: {
      tl: 15, cost: 35000, mass: 10,
      description: "<p>A backpack unit with a detachable handheld sensor that detects neural activity up to 500 meters away and gives a rough estimate of an organism's intelligence from its brainwave patterns. Data is interpreted with the Comms, Life Sciences, or Social Sciences skill.</p>",
    },
  },

  // ── Robots and Drones ────────────────────────────────────────────────────

  {
    name: "Cargo Robot",
    type: "equipment",
    system: {
      tl: 11, cost: 75000, mass: 0,
      description: "<p>A simple, heavy-duty robot found in starport docks and aboard cargo ships (STR 30, DEX 9, Hull 2, Structure 2, Armor 8, Huge). Runs a specialized Model 1 computer with Intellect/1 and an appropriate Expert program, and attacks with crushing strength (3D6) if needed. The SRD gives no physical mass figure.</p>",
    },
  },
  {
    name: "Repair Robot",
    type: "equipment",
    system: {
      tl: 11, cost: 10000, mass: 0,
      description: "<p>A small, crab-shaped shipboard robot carrying welding and cutting tools (STR 6, DEX 7, Hull 1, Structure 1), running Intellect/1 and Expert Mechanics/2 (or Expert Engineering for specialized variants). Attacks with its tools for 1D6 damage if needed. The SRD gives no physical mass figure.</p>",
    },
  },
  {
    name: "Personal Drone",
    type: "equipment",
    system: {
      tl: 11, cost: 2000, mass: 0,
      description: "<p>A small floating globe about 30 cm in diameter (STR 2, DEX 7, Hull 1, Structure 1, Tiny) equipped with a comm, grav floater, and holographic projector, allowing a character to maintain a virtual presence over great distances. The SRD gives no physical mass figure.</p>",
    },
  },
  {
    name: "Probe Drone",
    type: "equipment",
    system: {
      tl: 11, cost: 15000, mass: 0,
      description: "<p>A hardened, armored version of the personal drone (STR 3, DEX 7, Hull 3, Structure 3, Armor 5) carrying extra sensor packages, a comm, and a grav belt. Operating range is 500 km at speeds up to 300 kph. The SRD gives no physical mass figure.</p>",
    },
  },
  {
    name: "Autodoc",
    type: "equipment",
    system: {
      tl: 12, cost: 40000, mass: 0,
      description: "<p>A specialized, immobile medical robot (STR 6, DEX 15, Hull 1, Structure 1) often installed in vehicles or spacecraft, running Intellect/1 and Medicine/2 with an integral TL12 medikit. Its surgical tools deal 1D6 slashing damage if used as a weapon. The SRD gives no physical mass figure.</p>",
    },
  },
  {
    name: "Combat Drone",
    type: "equipment",
    system: {
      tl: 12, cost: 90000, mass: 0,
      description: "<p>Little more than a flying gun mated to a grav floater and computer (STR 12, DEX 10, Hull 4, Structure 4, Armor 9), piloted with Remote Operations while attacks use the mounted weapon's skill. Price is plus the cost of the integral weapon. Autonomous combat-capable variants (with Intellect and combat Expert programs) are illegal on many worlds. The SRD gives no physical mass figure.</p>",
    },
  },
  {
    name: "Servitor",
    type: "equipment",
    system: {
      tl: 13, cost: 120000, mass: 0,
      description: "<p>An expensive humanoid robot (STR 7, DEX 9, Hull 2, Structure 2) programmed as a butler or servant, typically running a Model 3 computer with Intellect/1 and Expert Steward/2 (with Expert Liaison/2 and Translator/1 available). Attacks with a punch for 1D6 damage if needed. The SRD gives no physical mass figure.</p>",
    },
  },

  // ── Sensory Aids ─────────────────────────────────────────────────────────

  {
    name: "Torch",
    type: "equipment",
    system: {
      tl: 1, cost: 1, mass: 0.25,
      description: "<p>Burns for 1 hour, clearly illuminating a 6-meter radius and providing shadowy illumination out to a 12-meter radius.</p>",
    },
  },
  {
    name: "Lamp Oil",
    type: "equipment",
    system: {
      tl: 2, cost: 2, mass: 0,
      description: "<p>Fuel for an oil lamp; negligible weight per portion.</p>",
    },
  },
  {
    name: "Oil Lamp",
    type: "equipment",
    system: {
      tl: 2, cost: 10, mass: 0.5,
      description: "<p>Clearly illuminates a 4.5-meter radius, provides shadowy illumination out to 9 meters, and burns for 6 hours on a pint of oil. Can be carried in one hand.</p>",
    },
  },
  {
    name: "Binoculars",
    type: "equipment",
    system: {
      tl: 3, cost: 75, mass: 1,
      description: "<p>Allows the user to see further. At TL8, electronic image capture and light-intensification versions exist (Cr750); at TL12, a PRIS (Portable Radiation Imaging System) version observes a wide EM-spectrum band from infrared to gamma rays (Cr3,500).</p>",
    },
  },
  {
    name: "Binoculars, Electronic",
    type: "equipment",
    system: {
      tl: 8, cost: 750, mass: 0,
      description: "<p>An electronically enhanced version of standard binoculars, adding image capture and light-intensification for use in the dark. The SRD gives no separate weight; likely comparable to standard binoculars (about 1 kg).</p>",
    },
  },
  {
    name: "Binoculars, PRIS",
    type: "equipment",
    system: {
      tl: 12, cost: 3500, mass: 0,
      description: "<p>A Portable Radiation Imaging System binocular variant allowing observation across a large section of the EM spectrum, from infrared to gamma rays. The SRD gives no separate weight; likely comparable to standard binoculars (about 1 kg).</p>",
    },
  },
  {
    name: "Electric Torch",
    type: "equipment",
    system: {
      tl: 5, cost: 10, mass: 0.5,
      description: "<p>The common flashlight: battery powered, lasting about 6 hours of continuous use, producing a wide cone of light 18 meters long with a 6-meter radius at the end of the beam. Later models add an adjustable tight beam (36 meters, 1-meter radius) or a 10-meter illumination radius.</p>",
    },
  },
  {
    name: "Cold Light Lantern",
    type: "equipment",
    system: {
      tl: 6, cost: 20, mass: 0.25,
      description: "<p>A fuel-cell powered lantern lasting 3 days of continuous use. Produces a wide cone of light up to 18 meters with a 6-meter radius, a tight beam up to 36 meters with a 1-meter radius, or a 10-meter illumination radius.</p>",
    },
  },
  {
    name: "Infrared Goggles",
    type: "equipment",
    system: {
      tl: 6, cost: 500, mass: 0,
      description: "<p>Permits the user to see exothermic (heat-emitting) sources in the dark. Negligible weight.</p>",
    },
  },
  {
    name: "Light Intensifier Goggles",
    type: "equipment",
    system: {
      tl: 7, cost: 500, mass: 0,
      description: "<p>Permits the user to see normally in anything less than total darkness by electronically intensifying available light. Negligible weight.</p>",
    },
  },

  // ── Shelters ─────────────────────────────────────────────────────────────

  {
    name: "Tarpaulin",
    type: "equipment",
    system: {
      tl: 1, cost: 10, mass: 2,
      description: "<p>A heavy, hard-wearing waterproof canvas sheet, 4 meters by 2 meters, used as a temporary shelter or protective covering against moisture.</p>",
    },
  },
  {
    name: "Tent",
    type: "equipment",
    system: {
      tl: 2, cost: 200, mass: 3,
      description: "<p>Basic shelter for two, protecting against precipitation, storms, and temperatures down to 0°C, and withstanding light to moderate winds. Larger, more elaborate tents cost and weigh more.</p>",
    },
  },
  {
    name: "Pre-Fabricated Cabin",
    type: "equipment",
    system: {
      tl: 6, cost: 10000, mass: 4000,
      description: "<p>Modular unpressurized quarters for 6, made of sixteen 1.5m×1.5m×2m modules, withstanding light to severe winds and temperatures down to -10°C. Takes 8 man-hours to erect or dismantle; weighs 4 tons dismantled.</p>",
    },
  },
  {
    name: "Basic Life Support Supplies",
    type: "equipment",
    system: {
      tl: 7, cost: 100, mass: 2,
      description: "<p>Waste reclamation chemicals, oxygen supply, and CO2 scrubbers sufficient to support one person for one day in an enclosed, pressurized environment such as a pressure tent or advanced base.</p>",
    },
  },
  {
    name: "Pressure Tent",
    type: "equipment",
    system: {
      tl: 7, cost: 2000, mass: 25,
      description: "<p>A basic pressurized shelter for two, providing standard atmosphere and protection from precipitation, storms, and up to strong winds. Has no airlock; must be depressurized to enter or leave.</p>",
    },
  },
  {
    name: "Advanced Base",
    type: "equipment",
    system: {
      tl: 8, cost: 50000, mass: 6000,
      description: "<p>Modular pressurized quarters for 6, made of sixteen 1.5m×1.5m×2m modules, withstanding anything short of hurricane-force winds and most temperature extremes. Takes 12 man-hours to erect or dismantle, weighs 6 tons dismantled, and its cost includes 7 days of life support for six people.</p>",
    },
  },

  // ── Survival Equipment ───────────────────────────────────────────────────

  {
    name: "Cold Weather Clothing",
    type: "equipment",
    system: {
      tl: 1, cost: 200, mass: 2,
      description: "<p>Protects against frigid weather (-20°C or below), adding +2 DM to Endurance checks made to resist cold exposure. Weight decreases by 1 kg for every 5 TL.</p>",
    },
  },
  {
    name: "Filter Mask",
    type: "equipment",
    system: {
      tl: 3, cost: 10, mass: 0,
      description: "<p>Allows breathing of tainted atmospheres (types 4, 7, and 9) and protects against inhaled heavy smoke or dust. Negligible weight.</p>",
    },
  },
  {
    name: "Swimming Equipment",
    type: "equipment",
    system: {
      tl: 3, cost: 200, mass: 1,
      description: "<p>Swim fins, wet suit, and face mask. Protects against cold (5°C or below) and improves underwater speed and maneuverability, adding +1 DM to Athletics checks made underwater.</p>",
    },
  },
  {
    name: "Combination Mask",
    type: "equipment",
    system: {
      tl: 5, cost: 150, mass: 0,
      description: "<p>Combines filter mask and respirator, allowing breathing of very thin, tainted atmospheres (type 2) as well as everything covered by filter and respirator masks alone. Negligible weight.</p>",
    },
  },
  {
    name: "Oxygen Tanks",
    type: "equipment",
    system: {
      tl: 5, cost: 500, mass: 5,
      description: "<p>Compressed oxygen tanks allowing independent breathing in smoke, dust, gas, or exotic (type A) atmospheres. Two tanks last 6 hours; a refill costs Cr20.</p>",
    },
  },
  {
    name: "Respirator",
    type: "equipment",
    system: {
      tl: 5, cost: 100, mass: 0,
      description: "<p>A small compressor allowing an individual to breathe in very thin atmospheres (type 3). Negligible weight.</p>",
    },
  },
  {
    name: "Underwater Air Tanks",
    type: "equipment",
    system: {
      tl: 5, cost: 800, mass: 5,
      description: "<p>Equivalent to oxygen tanks but designed for underwater use. Two tanks last 6 hours; a refill for the proper mixture and depth costs Cr20.</p>",
    },
  },
  {
    name: "Artificial Gill",
    type: "equipment",
    system: {
      tl: 8, cost: 4000, mass: 4,
      description: "<p>Extracts oxygen from water, allowing the wearer to breathe indefinitely while submerged. Functions only on worlds with thin through dense (type 4-9) atmospheres.</p>",
    },
  },
  {
    name: "Environment Suit",
    type: "equipment",
    system: {
      tl: 8, cost: 500, mass: 0,
      description: "<p>Protects the wearer from extreme cold or heat with a hood, gloves, and boots, leaving the face exposed in normal operation. The SRD gives no weight.</p>",
    },
  },
  {
    name: "Rescue Bubble",
    type: "equipment",
    system: {
      tl: 9, cost: 600, mass: 3,
      description: "<p>A 2-meter pressurized plastic bubble whose piezoelectric walls recharge its batteries and distress beacon from the occupant's movement; a small oxygen tank inflates the bubble and provides two person-hours of life support. Used as an emergency lifeboat on both spacecraft and watercraft.</p>",
    },
  },
  {
    name: "Thruster Pack",
    type: "equipment",
    system: {
      tl: 9, cost: 2000, mass: 5,
      description: "<p>Gives the user the ability to maneuver in zero gravity, requiring a Zero-G check to use accurately. Usable only in microgravity, and practical only for short journeys between spacecraft at Adjacent range.</p>",
    },
  },
  {
    name: "Portable Generator",
    type: "equipment",
    system: {
      tl: 10, cost: 500000, mass: 15,
      description: "<p>A heavy-duty portable fusion generator capable of recharging weapons and other equipment for up to a month of use.</p>",
    },
  },

  // ── Tools ────────────────────────────────────────────────────────────────

  {
    name: "Mechanical Toolkit",
    type: "equipment",
    system: {
      tl: 4, cost: 1000, mass: 12,
      description: "<p>Diagnostic sensors, hand tools, computer analysis programs (at appropriate TLs), and spare parts. Required for repairs and construction.</p>",
    },
  },
  {
    name: "Electronics Toolkit",
    type: "equipment",
    system: {
      tl: 5, cost: 1000, mass: 12,
      description: "<p>Diagnostic sensors, hand tools, computer analysis programs (at appropriate TLs), and spare parts. Required for electrical repairs and installations.</p>",
    },
  },
  {
    name: "Lock Pick Set",
    type: "equipment",
    system: {
      tl: 5, cost: 10, mass: 0,
      description: "<p>Allows picking of ordinary mechanical locks. Illegal on worlds of Law Level 8+, where the cost rises to Cr100 or more. Negligible weight.</p>",
    },
  },
  {
    name: "Medical Kit",
    type: "equipment",
    system: {
      tl: 7, cost: 1000, mass: 10,
      description: "<p>Diagnostic devices and scanners, surgical tools, and a range of drugs and antibiotics, allowing a medic to practice in the field.</p>",
    },
  },
  {
    name: "Forensics Toolkit",
    type: "equipment",
    system: {
      tl: 8, cost: 1000, mass: 12,
      description: "<p>Diagnostic sensors, hand tools, computer analysis programs (at appropriate TLs), and spare parts. Required for investigating crime scenes and testing samples.</p>",
    },
  },
  {
    name: "Engineering Toolkit",
    type: "equipment",
    system: {
      tl: 9, cost: 1000, mass: 12,
      description: "<p>Diagnostic sensors, hand tools, computer analysis programs (at appropriate TLs), and spare parts. Required for repairs and installing new equipment.</p>",
    },
  },
  {
    name: "Scientific Toolkit",
    type: "equipment",
    system: {
      tl: 9, cost: 1000, mass: 12,
      description: "<p>Diagnostic sensors, hand tools, computer analysis programs (at appropriate TLs), and spare parts. Required for scientific testing and analysis.</p>",
    },
  },
  {
    name: "Surveying Toolkit",
    type: "equipment",
    system: {
      tl: 9, cost: 1000, mass: 12,
      description: "<p>Diagnostic sensors, hand tools, computer analysis programs (at appropriate TLs), and spare parts. Required for planetary surveys or mapping.</p>",
    },
  },

  // ── Vehicles ─────────────────────────────────────────────────────────────
  // The SRD's Common Vehicles table gives Cost (in KCr) and performance stats
  // (Skill/Agility/Speed/Crew & Passengers/Open-Closed/Armor/Hull/Structure/
  // Weapons) but no vehicle mass or tonnage figure, so mass is 0 throughout;
  // cargo capacities given in the SRD's prose are noted in each description.

  {
    name: "Steamship",
    type: "equipment",
    system: {
      tl: 4, cost: 720000, mass: 0,
      description: "<p>A watercraft propelled by a steam engine (Ocean Ships skill, Agility -3, Speed 30 kph, crew 5 plus 10 passengers, Closed, Armor 2, Hull 40, Structure 40, no weapons). Cargo capacity is 50 tons.</p>",
    },
  },
  {
    name: "Biplane",
    type: "equipment",
    system: {
      tl: 5, cost: 46000, mass: 0,
      description: "<p>A primitive twin-winged aircraft (Winged Aircraft skill, Agility +1, Speed 250 kph, 1 pilot plus 1 passenger, Closed, Armor 2, Hull 1, Structure 1, no weapons). Can transport only 100 kg of cargo.</p>",
    },
  },
  {
    name: "Ground Car",
    type: "equipment",
    system: {
      tl: 5, cost: 6000, mass: 0,
      description: "<p>A conventional wheeled automobile (Wheeled Vehicle skill, Agility +0, Speed 150 kph, 1 driver plus 3 passengers, Closed, Armor 6, Hull 3, Structure 2, no weapons).</p>",
    },
  },
  {
    name: "Motor Boat",
    type: "equipment",
    system: {
      tl: 5, cost: 530000, mass: 0,
      description: "<p>A hydrofoil-equipped watercraft valued for its speed and performance (Motorboats skill, Agility -3, Speed 120 kph, crew 5 plus 10 passengers, Closed, Armor 3, Hull 16, Structure 17, no weapons). Holds up to 10 tons of cargo.</p>",
    },
  },
  {
    name: "Helicopter",
    type: "equipment",
    system: {
      tl: 6, cost: 250000, mass: 0,
      description: "<p>A rotor aircraft capable of vertical and horizontal flight, controlled by rotor pitch (Rotor Aircraft skill, Agility +1, Speed 100 kph, 1 pilot plus 7 passengers, Closed, Armor 3, Hull 2, Structure 3, no weapons). Can carry 500 kg of cargo.</p>",
    },
  },
  {
    name: "Submersible",
    type: "equipment",
    system: {
      tl: 6, cost: 1700000, mass: 0,
      description: "<p>A watercraft designed to operate below the ocean's surface, often used to transport passengers between domed waterworld cities (Submarine skill, Agility -4, Speed 40 kph, crew 5 plus 10 passengers, Closed, Armor 3, Hull 85, Structure 85, no weapons). Carries 30 tons of cargo.</p>",
    },
  },
  {
    name: "Twin Jet Aircraft",
    type: "equipment",
    system: {
      tl: 6, cost: 480000, mass: 0,
      description: "<p>A fixed-wing jet aircraft often used to transport cargo (Winged Aircraft skill, Agility +1, Speed 600 kph, 2 pilots plus 6 passengers, Closed, Armor 3, Hull 5, Structure 5, no weapons). Cargo hold capacity is 5 tons.</p>",
    },
  },
  {
    name: "Hovercraft",
    type: "equipment",
    system: {
      tl: 7, cost: 880000, mass: 0,
      description: "<p>Travels over land or water on a cushion of air from a downward blast (uses Rotor Aircraft skill per the SRD's vehicle table, Agility +1, Speed 150 kph, 1 pilot plus 15 passengers, Closed, Armor 3, Hull 7, Structure 8, no weapons). Cargo space is 3 tons.</p>",
    },
  },
  {
    name: "Air/Raft",
    type: "equipment",
    system: {
      tl: 8, cost: 275000, mass: 0,
      description: "<p>An open-topped, anti-gravity vehicle, ubiquitous and reliable (Grav Vehicle skill, Agility +0, Speed 400 kph, 1 pilot plus 3 passengers, Open, Armor 6, Hull 2, Structure 2, no weapons). Can reach orbit (taking hours equal to the world's Size code) but passengers need vacc suits at altitude.</p>",
    },
  },
  {
    name: "Speeder",
    type: "equipment",
    system: {
      tl: 8, cost: 890000, mass: 0,
      description: "<p>A streamlined grav vehicle capable of high-speed planetary transit (Grav Vehicle skill, Agility +2, Speed 1,500 kph, 1 pilot plus 1 passenger, Closed, Armor 3, Hull 1, Structure 2, no weapons). Limited to 100 kg of cargo; can reach orbit in about an hour.</p>",
    },
  },
  {
    name: "Destroyer",
    type: "equipment",
    system: {
      tl: 9, cost: 4800000, mass: 0,
      description: "<p>A fast, maneuverable, long-endurance warship built to escort larger fleets and defend against smaller attackers (Ocean Ships skill, Agility -5, Speed 40 kph, crew 10 plus 8 gunners plus 12 passengers, Closed, Armor 8, Hull 63, Structure 63). The SRD's stat table lists no weapons despite the gunner crew and prose description of deck-mounted turrets — likely an errata in the source book; cargo capacity is limited to 40 tons, mostly ammunition.</p>",
    },
  },
  {
    name: "Grav Floater",
    type: "equipment",
    system: {
      tl: 11, cost: 500, mass: 0,
      description: "<p>A forerunner of the grav belt: a platform on which a single rider stands (Grav Vehicle skill, Agility -2, Speed 40 kph, 1 rider, Open, Structure 1, no weapons). Cannot achieve great speed but, like an air/raft, can reach any altitude up to orbit.</p>",
    },
  },
  {
    name: "AFV",
    type: "equipment",
    system: {
      tl: 12, cost: 65000, mass: 0,
      description: "<p>A heavily armored fighting vehicle equipped with a triple laser turret (Tracked Vehicle skill, Agility +0, Speed 80 kph, 1 driver plus 9 passengers, Closed, Armor 18, Hull 5, Structure 5). The turret's lasers use the Energy Rifle skill and deal 4D6 damage each; one, two, or three lasers may fire at the same target in a single attack.</p>",
    },
  },
  {
    name: "ATV",
    type: "equipment",
    system: {
      tl: 12, cost: 50000, mass: 0,
      description: "<p>An enclosed, pressurized all-terrain vehicle able to float on calm water, with built-in sensors and communications (usually a laser transceiver), ideal for exploration (Tracked Vehicle skill, Agility +0, Speed 100 kph, 1 driver plus 15 passengers, Closed, Armor 12, Hull 5, Structure 5). Has a turret hardpoint but carries no weapon by default.</p>",
    },
  },
  {
    name: "Grav Belt",
    type: "equipment",
    system: {
      tl: 12, cost: 100000, mass: 0,
      description: "<p>A parachute-harness-like device fitted with artificial gravity modules, letting the wearer fly (Zero-G skill, Agility +2, Speed 300 kph, 1 wearer, Open, Structure -, no weapons). Its internal battery lasts 4 hours before recharging (12 hours at TL15); no options can be added to it.</p>",
    },
  },
  {
    name: "G/Carrier",
    type: "equipment",
    system: {
      tl: 15, cost: 150000, mass: 0,
      description: "<p>Effectively a flying tank and the standard fighting vehicle of many military forces (Grav Vehicle skill, Agility +0, Speed 620 kph, 1 driver plus 1 gunner plus 14 passengers, Closed, Armor 25, Hull 8, Structure 8). Mounts a turreted fusion gun (a vehicle-mounted TL15 FGMP with advanced containment) and, like the air/raft, can reach orbit.</p>",
    },
  },
];
