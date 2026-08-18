# Cepheus Engine SRD for Foundry VTT

A [Foundry Virtual Tabletop](https://foundryvtt.com/) game system implementing the **Cepheus
Engine System Reference Document** — an open-source sci-fi RPG based on Classic Traveller.

> Cepheus Engine and Samardan Press are the trademarks of Jason "Flynn" Kemp. This project is
> a fan-made, unofficial implementation and is not affiliated with, endorsed by, or sponsored
> by Jason "Flynn" Kemp or Samardan Press™.

## Features

- **Actors:** full player characters, NPCs, creatures, and tonnage-based starships, each with a
  dedicated sheet.
- **Core mechanic:** 2D6 + skill + characteristic DM vs. a six-tier difficulty table, with
  automatic wound-state penalties.
- **Character generation:** a guided lifepath wizard — roll characteristics, choose a career,
  play through terms (survival, skills, commission, advancement, reenlistment), muster out, and
  apply the result straight to a character sheet. All 24 SRD careers are included.
- **Psionics:** PSI pool generation, per-power costs, and recovery.
- **Space combat:** initiative, weapon attack/damage rolls, and the SRD's full hit-location
  resolution (hull, structure, armor, subsystems, turrets/bays, crew).
- **Compendia:** ready-to-use packs for skills, weapons, armor, equipment, GM rollable tables,
  and macros, sourced directly from the SRD (plus a homebrew cybernetics/augments pack).

See [`PROJECT_STATUS.md`](PROJECT_STATUS.md) for a detailed, file-by-file map of what's
implemented and what's known to be incomplete.

## Requirements

- Foundry Virtual Tabletop **v14** (verified against v14; not tested on earlier versions).

## Installation

1. In Foundry's **Setup** screen, go to **Game Systems → Install System**.
2. Paste this manifest URL:
   `https://github.com/JoshuaErney/cepheus-engine/releases/latest/download/system.json`
3. Click **Install**.

Or install manually by cloning/downloading this repository into your Foundry
`Data/systems/cepheus-engine` folder (the folder name must be `cepheus-engine` to match the
system id in `system.json`).

## Development

This system is plain JavaScript (ES modules, no build step). See
[`CLAUDE.md`](CLAUDE.md) for the full architecture and conventions reference.

```bash
# Symlink into your local Foundry Data folder for live testing:
ln -s "$(pwd)" ~/Library/Application\ Support/FoundryVTT/Data/systems/cepheus-engine

# Run the test suite (requires bun: https://bun.sh):
bun test
```

Reload Foundry with `F5` after making changes — no build step is needed.

## Legal & Attribution

This project is built on the **Cepheus Engine System Reference Document**, Copyright © 2016
Samardan Press, and distributed as Open Game Content under the **Open Game License v1.0a**.

- The full license text is reproduced in [`OPEN_GAME_LICENSE.txt`](OPEN_GAME_LICENSE.txt),
  including the required Section 15 copyright notice chain.
- **Open Game Content:** all SRD-derived rules text and compendium data in this system (skills,
  weapons, armor, equipment, tables, and career data) is Open Game Content, exactly as
  designated by the Cepheus Engine SRD itself.
- **Product Identity (excluded from the above):** the trademarks "Cepheus Engine" and "Samardan
  Press," and any product titles published by Samardan Press, are Product Identity and are not
  Open Game Content. This project uses the "Cepheus Engine" name solely to indicate rules
  compatibility, under the terms of the Cepheus Engine Compatibility-Statement License.
- **This project's own code** (JavaScript, Handlebars templates, CSS — everything outside the
  Open Game Content described above) is original work, Copyright © 2026 Joshua Erney, licensed
  separately under the [MIT License](LICENSE).

If you believe any content here oversteps these boundaries, please open an issue.

## Bug Reports & Contributions

Please use [GitHub Issues](https://github.com/JoshuaErney/cepheus-engine/issues) to report bugs
or request features.
