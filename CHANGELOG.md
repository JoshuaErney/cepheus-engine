# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-08-18

Adds the remaining SRD Chapter 10 space combat systems: missiles, sand, screens, and
abstract boarding actions. None of this has been exercised in a live Foundry session yet
(see PROJECT_STATUS.md §4) — static review and `bun test` only.

- **Missiles** (racks/turrets and bays; standard/smart/nuclear): a two-step launch-then-impact
  flow (`rollShipMissileLaunch` / `rollShipMissileImpact`) that reports flight time and the
  impact to-hit target for the GM to track, since Foundry has no turn-scheduler to auto-resolve
  the SRD's multi-turn missile flight. Smart missiles always need 8+ and can re-attack each
  turn; nuclear missiles flag their bonus radiation hit. Ammo (missiles/canisters) is now
  tracked per component.
- **Point Defense**: turret lasers (pulse/beam, turret-mounted) can attempt to shoot down an
  inbound missile, with a cumulative DM-1 per consecutive attempt.
- **Sand**: offensive Close-range sandcaster use (fixed 1 point of damage) plus a defensive
  Fire Sand reaction that reduces an incoming beam attack by 1D6, consuming a canister.
- **Screens**: meson screen / nuclear damper ship components and a Trigger Screens reaction
  (2D6 + Screens skill damage reduction; nuclear dampers also negate the automatic radiation
  hit from nuclear missiles).
- **Boarding actions**: the Abstract Boarding Rules (opposed Tactics check, `rollShipBoardingRound`)
  — degree of success read off the winner's own Effect, resolving into a Single Hit of internal
  damage, an Exceptional Success boarding/repel outcome, or (Exceptional Success, attacker wins)
  2D6 of internal damage via the existing Hit Location pipeline.
- A few SRD interpretation calls were necessary and are documented in code where made: missile
  launch-check difficulty (the SRD's Attack Difficulties table omits missiles — treated as flat
  Average at every valid range), and Point Defense's check difficulty (also unstated — same
  treatment).

Adds the narrower SRD encounter sub-tables and makes chained RollTable draws actually work.

- 10 new "X Encounter Type" 1D6 sub-tables (Alien Vessel, Astrogation, Derelict, Hostile
  Vessel, Merchant Vessel, Military Vessel, Personal Vessel, Spacecraft, Space Habitat, Space
  Junk) and a 1D6 Animal Encounter Template, transcribed from SRD pp.183, 193-195.
- Drawing "Starship Encounters" now automatically continues onto the matching vessel-type
  sub-table instead of just naming it — new `drawTableChained()` helper (exposed as
  `game.cepheus.drawTableChained`), used by the "Roll on Table" macro.
- **Migration note:** worlds already on an earlier system version keep their existing
  "Starship Encounters" table unchanged after upgrading (only missing-by-name entries are
  added by the sync step) — delete and let it re-seed, or edit it by hand, to pick up chaining.

## [0.1.1] - 2026-08-18

Critical fixes found during the first live Foundry v14 session against this codebase —
v0.1.0's actor sheets were unusable (blank below the header) for every actor type.

- Fix every actor sheet rendering blank below the header (tab-content sections never
  received the `active` CSS class needed to display them).
- Fix `system.characteristics` being silently wiped on every data-prep cycle for
  character/npc/creature actors (`getRollData()` was mutating the live actor data by
  reference instead of a copy) — broke UPP, characteristic/skill/attack rolls, initiative,
  and wound state.
- Fix character generation's Step 1 showing all-zero characteristics on first open.

## [0.1.0] - 2026-08-18

Initial public release.

- Actor types: character, npc, creature, ship — each with a dedicated sheet.
- Core 2D6 task-resolution mechanic with wound-state penalties.
- Full character generation wizard (24 SRD careers, lifepath terms, muster-out).
- Psionics (PSI pool, per-power costs, recovery).
- Space combat: initiative, attack/damage rolls, full SRD hit-location resolution.
- Compendia: skills, weapons, armor, equipment, GM rollable tables, macros, and a homebrew
  augments/cybernetics pack.
- Automated test suite (`bun test`) covering pure game-logic modules.
