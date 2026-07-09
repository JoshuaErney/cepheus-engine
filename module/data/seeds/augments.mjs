// Homebrew cybernetic/bio-augment items. The core Cepheus Engine SRD does not
// include a cybernetics equipment table, so these are original content built
// on the AugmentData schema (characteristic bonus + TL + cost), not SRD
// transcriptions. Costs/TLs are ballparked against the SRD's cybernetic-parts
// pricing (p.116) and comparable Traveller-line cybernetics.

export const AUGMENTS_SEED = [
  {
    name: "Cybernetic Arm (Basic)",
    type: "augment",
    system: {
      characteristic: "str",
      bonus: 1,
      tl: 9,
      cost: 20000,
      description: "<p>A basic prosthetic replacement arm with servo-assisted actuators. Grants +1 STR while the limb is in use.</p>",
    },
  },
  {
    name: "Cybernetic Arm (Advanced)",
    type: "augment",
    system: {
      characteristic: "str",
      bonus: 2,
      tl: 12,
      cost: 100000,
      description: "<p>A military-grade prosthetic arm with reinforced myomer bundles. Grants +2 STR while the limb is in use.</p>",
    },
  },
  {
    name: "Cybernetic Legs (Basic)",
    type: "augment",
    system: {
      characteristic: "dex",
      bonus: 1,
      tl: 9,
      cost: 20000,
      description: "<p>A pair of prosthetic legs with basic balance and reflex compensation. Grants +1 DEX while worn.</p>",
    },
  },
  {
    name: "Cybernetic Legs (Advanced)",
    type: "augment",
    system: {
      characteristic: "dex",
      bonus: 2,
      tl: 12,
      cost: 100000,
      description: "<p>High-response prosthetic legs with gyroscopic stabilization. Grants +2 DEX while worn.</p>",
    },
  },
  {
    name: "Wired Reflexes",
    type: "augment",
    system: {
      characteristic: "dex",
      bonus: 1,
      tl: 11,
      cost: 75000,
      description: "<p>A neural implant that shortcuts the signal path between brain and spine, quickening reaction time. Grants +1 DEX; the referee may also grant a bonus to initiative rolls.</p>",
    },
  },
  {
    name: "Synthetic Organ Cluster",
    type: "augment",
    system: {
      characteristic: "end",
      bonus: 1,
      tl: 9,
      cost: 30000,
      description: "<p>A set of redundant synthetic organs (liver, kidneys, secondary heart) that improve the body's resilience. Grants +1 END.</p>",
    },
  },
  {
    name: "Endocrine Regulator",
    type: "augment",
    system: {
      characteristic: "end",
      bonus: 2,
      tl: 12,
      cost: 120000,
      description: "<p>An implanted regulator that manages adrenaline, pain response, and fatigue toxins in real time. Grants +2 END.</p>",
    },
  },
  {
    name: "Cerebral Booster (Basic)",
    type: "augment",
    system: {
      characteristic: "int",
      bonus: 1,
      tl: 10,
      cost: 50000,
      description: "<p>A cranial implant that augments working memory and processing speed. Grants +1 INT.</p>",
    },
  },
  {
    name: "Cerebral Booster (Advanced)",
    type: "augment",
    system: {
      characteristic: "int",
      bonus: 2,
      tl: 13,
      cost: 200000,
      description: "<p>A next-generation cranial implant with a dedicated co-processor lobe. Grants +2 INT.</p>",
    },
  },
  {
    name: "Cosmetic Bio-Sculpt",
    type: "augment",
    system: {
      characteristic: "soc",
      bonus: 1,
      tl: 8,
      cost: 10000,
      description: "<p>Subtle cosmetic and postural bio-sculpting that improves the subject's bearing and first impression. Grants +1 SOC in social settings where appearance matters.</p>",
    },
  },
  {
    name: "Subdermal Comm Implant",
    type: "augment",
    system: {
      characteristic: "",
      bonus: 0,
      tl: 9,
      cost: 5000,
      description: "<p>A short-range communicator implanted beneath the skin, activated subvocally. No mechanical bonus, but frees the hands and can't be easily confiscated.</p>",
    },
  },
  {
    name: "Cybernetic Toolkit Implant",
    type: "augment",
    system: {
      characteristic: "",
      bonus: 0,
      tl: 10,
      cost: 15000,
      description: "<p>A fingertip-housed set of micro-tools (data jack, wire probe, laser cutter, multimeter leads) for field repair and electronics work. No mechanical bonus; the referee may waive the need for a separate tool kit for minor tasks.</p>",
    },
  },
];
