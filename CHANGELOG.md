# Changelog

All notable changes to this project are documented in this file.

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
