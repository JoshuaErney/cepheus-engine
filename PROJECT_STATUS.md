# Cepheus Engine SRD — Project Status & Reference Map

**Purpose of this file:** a single-document map of the system's current state, written so
an AI assistant (or a human) can load it and understand what exists, how it works, and
what's left — without re-reading the whole codebase. Complements `CLAUDE.md` (which
covers *conventions and how-to*); this file covers *what's actually built*.

Last reviewed: 2026-08-18. Re-verify against the code before trusting specifics — this is
a snapshot, not a live source of truth. A git repo was initialized 2026-07-08
(see `git log`); treat file line numbers here as approximate.

2026-08-18 (same day, fifth follow-up — first live Foundry v14 session since 08-18's
morning session, run via a scripted Playwright harness against the real Electron app):
found and fixed three real bugs, none catchable by `bun test` or static review:
- **shipComponent item sheet's Weapon Type / Mount `<select>`s silently corrupted data on
  every subsequent field edit.** `templates/item/body.hbs` marked the selected `<option>`
  via `{{#if (eq key system.weaponType)}}` — missing the `../` needed to escape the
  `{{#each weaponTypeOptions}}` block's context change (`this` inside `#each`, even with
  block params, rebinds to the current iteration value, not the outer item context — see
  `missileType`/`screenType`'s already-correct `../system.X` pattern a few lines below,
  which is what exposed the inconsistency). The dropdown always displayed "None," and —
  because `submitOnChange` resubmits the *entire* form on every field change, not a diff —
  the next unrelated edit (setting Mount, Damage, anything) silently wrote that wrong blank
  value back to `weaponType`/`mount`, erasing whatever had actually been configured. This
  predates the missiles/sand/screens/boarding work entirely (same bug pattern in the
  original beam-weapon UI); only surfaced now because this was the first time anyone
  actually configured a shipComponent through the item sheet in a live session. Fixed by
  adding `../` to both selects.
- **The chained-table seeding used a deprecated, non-functional Foundry schema.**
  `tableResults()` (seeds/tables.mjs) wrote `type: "pack"`, `documentCollection`,
  `documentId: null`, `text` — the Foundry v11/v12 TableResult shape. Live introspection of
  `foundry.documents.BaseTableResult.schema` on a running v14 (build 367) server showed
  none of those fields exist anymore: the actual fields are `type` (choices `"text"` /
  `"document"` — there's no `"pack"`), `documentUuid` (a single UUID string), and
  `description` (`text` is a deprecated compat *getter*, with no corresponding *setter* —
  it silently drops on write, which is why `resolveTableReferences()`'s
  `documentId: target.id` patch never actually took). Fixed `tableResults()`/`textResults()`
  and `resolveTableReferences()` to use `type: "document"` / `documentUuid: target.uuid` /
  `description`.
- **Foundry's own `RollTable#draw()` already auto-resolves a `type: "document"` result
  that points at another RollTable** — confirmed live (a bare `draw()` call on a correctly-
  seeded Starship Encounters posted exactly one chat message showing the *sub-table's*
  drawn result). This made the custom `helpers/tables.mjs` `drawTableChained()` wrapper
  from the third follow-up entirely unnecessary — deleted it, along with
  `game.cepheus.drawTableChained` and the "Roll on Table" macro's use of it (back to a
  bare `table.draw()`). Net simplification: the real fix was only ever the schema
  correction above.

Also fixed while live-testing (pre-existing, unrelated to the day's other work): every
check-style chat message (`rollSkill`/`rollAttack`/`rollPsionic`/`rollShipAttack`/
`rollShipMissileLaunch`) displayed the difficulty target twice — `check.diffLabel` (e.g.
"Average (8+)") already embeds the target number, and the code appended a redundant
`(${check.target}+)` after it. Removed the redundant append at all 5 call sites in
actor.mjs.

Confirmed working as designed (no issues): missile launch→impact two-step flow including
smart-missile wording and ammo/loaded consumption; Point Defense; offensive and defensive
sandcaster fire including the flat-1-point offensive damage special case; Trigger Screens;
Reload Weapons System (including the "isn't loaded — reload it first" gate blocking both
offensive and defensive sandcaster fire); the Apply Hit dialog's 3-way Radiation select for
both "standard" (armor-DM'd bonus hit) and "meson" (armor bypassed entirely, forced
internal Hit Location column); all three Boarding Action outcome branches (regular
Success, Exceptional Success for each side); and — once the schema fix above landed — the
Starship Encounters → sub-table chained draw itself. NPC/creature/character sheet
rendering also re-confirmed with no regressions (an apparently-blank Notes tab on a fresh
NPC turned out to be a correctly-rendering, correctly-classed, genuinely-empty ProseMirror
editor — not a revival of the original blank-tab bug — confirmed via direct DOM inspection).

2026-08-18 (same day, fourth follow-up): closed the two remaining space-combat gaps from
v0.2.0's §5 — Reload Weapons System (missile launchers/sandcasters now track a `loaded`
state independent of ammo, per SRD p.152) and the bonus radiation crew hit special rule
(SRD p.157 — automatic, not conditional on the Hit Location roll landing on Crew;
`applyShipDamage`'s `radiation` param changed from boolean to a "" / "standard" / "meson"
string as part of this). Regions-based AoE tooling stays deliberately unbuilt — no concrete
use case to attach it to. See §2/§3 for specifics.

2026-08-18 (same day, third follow-up): added the 10 narrower SRD "X Encounter Type"
sub-tables and the 1D6 Animal Encounter Template that §5 previously listed as not included,
and — since those sub-tables are useless without it — actual chained-draw behavior
(`helpers/tables.mjs` `drawTableChained()`, wired into the "Roll on Table" macro) rather than
just the seed-authoring plumbing for it that already existed unused. See the `tables` pack
row in §2 for the full list and a migration caveat: worlds already running an earlier system
version keep their old, non-chaining "Starship Encounters" table after upgrading, since
`syncPack()` only adds missing-by-name entries and never rewrites an existing one.

2026-08-18 (same day, second follow-up): added the remaining SRD Chapter 10 space combat
systems that §5 previously listed as "not yet started" — missiles (launch/impact/point
defense), sand (offensive + defensive Fire Sand), screens (Trigger Screens), and Abstract
Boarding Rules. See §2's actor.mjs/config.mjs/item-data.mjs/ship-sheet.mjs entries and §3 for
what was built, and §4 for the judgment calls this required (mirroring the project's existing
convention of documenting SRD ambiguities in code, e.g. `damageToHits()`'s damage>44 case).
Not yet exercised in a live Foundry session — static review + `bun test` only, same caveat as
every other addition since the 07-26 structural pass until it's actually clicked through.

2026-08-18: release-prep pass — added LICENSE (MIT, for original code),
OPEN_GAME_LICENSE.txt (verbatim OGL v1.0a + Section 15 copyright chain,
extracted from the SRD PDF), README.md (with the required Cepheus Engine
Compatibility-Statement License disclaimer), CHANGELOG.md, GitHub Actions
CI/release workflows, and filled in system.json's url/manifest/download/
readme/license/bugs/changelog fields against github.com/JoshuaErney/
cepheus-engine. Removed `background` from system.json and untracked both
the personally-watermarked SRD reference PDF and assets/background.jpg
(unverified art license) — see §4.

2026-08-18 (same day, follow-up): first-ever live Foundry v14 session against this
codebase — found and fixed three release-blocking bugs that static review and `bun test`
could not have caught (every actor sheet rendered blank; `system.characteristics` silently
emptied on every prepare cycle; chargen's first paint showed all-zero characteristics). See
§4's "Resolved 2026-08-18" entry for root causes and fixes. The system has now actually been
clicked through — chargen end-to-end, campaign-folder seeding, and full ship combat
(attack → damage → hit resolution) all confirmed working live.

2026-07-26: a structural-consistency pass reorganized shared plumbing (base actor
sheet class, dialog helpers, unified 2d6 check pipeline, config-derived enum
choices, name-based pack sync). Descriptions below reflect the post-refactor
state; none of it has been exercised in a live Foundry session yet (see §4).

---

## 1. High-level map

```mermaid
mindmap
  root((Cepheus Engine SRD))
    Actors
      character (full sheet + chargen)
      npc (character minus chargen/bio)
      creature (stat-block style)
      ship (tonnage-based)
    Items
      skill (incl. 5 psionic talents)
      weapon
      armor
      equipment
      augment (wired into actor UI, homebrew seed content — no SRD source table)
      shipComponent
    Core mechanics
      2D6 + skill + char DM vs difficulty
      Wound states (healthy/lightly/seriously/mortally/dead)
      Psionics (PSI pool, cost-per-use, recovery)
      Ship tonnage/fuel/power math
      Space combat (initiative, weapon attack/damage, full hit-location resolution,
        missiles, point defense, sand, screens, abstract boarding actions)
    Character generation
      6-characteristic roll/entry
      24-career lifepath loop
      Muster-out (cash/benefits tables)
      Apply-to-actor (skills, chars, bio, credits)
    Compendia
      73 skills
      39 weapons
      9 armors
      121 equipment items
      12 augments (homebrew, seeded)
      16 GM rollable tables (SRD-sourced: Random/Patron/Rumor encounters, chained
        Starship Encounters + 10 vessel-type sub-tables, 1D6 + 2D6 Animal Encounter
        templates)
      6 ready-to-use macros (roll-on-table [chains sub-tables automatically],
        apply/heal damage, ship initiative, full recovery, create campaign folders)
    Tests
      bun test — 101 tests, pure-logic modules + data/localization only (no
      Foundry-document/sheet/chargen coverage — see §2 tests/)
    Known gaps
      background.jpg pulled from system.json/repo — unverified license, needs
      a real replacement before it's referenced again
```

---

## 2. File-by-file inventory

```
system.json           Manifest. v0.1.0, compat min/verified "14". 7 packs registered
                       (skills/weapons/armor/equipment/augments/tables/macros).
cepheus.mjs            Entry point. Registers doc classes (incl. CepheusCombatant for
                       ship initiative), data models, sheets (per actor type —
                       character/npc/creature/ship each get a distinct sheet class),
                       Handlebars helpers. On `ready` (GM only): syncPack() adds any
                       seed entries missing by name from each of the seven packs —
                       covers both first-launch seeding and system updates that
                       extend a seed file reaching existing worlds.

module/config/config.mjs
  CONFIG.CEPHEUS = { characteristics, characteristicsAbbr, difficulties (6 tiers,
  targets 4/6/8/10/12/14), dmByValue (index 0-15 → DM -3..+2), behaviorTypes (7
  creature behavior enums), spaceCombat (see below) }.
  CEPHEUS.spaceCombat: rangeBands (7), weaponTypes (7, incl. "missile"), mounts (turret/bay),
  attackDifficulty (weaponType × range → difficulty key, SRD p.149 — missile row is a
  documented judgment call, see §3), hitLocation (2D6 → external/internal/smallCraft
  location key, SRD p.159), locationLabels (i18n keys — single label source for sheet
  subsystem rows AND hit-resolution chat, localized at use), subsystems (per-location
  3-tier effect text + overflow target, SRD p.159-161; the ship sheet derives its
  damage-track rows from these keys), mountHits (turret/bay 3-tier tracks),
  crewDamage (2D6 → Crew Damage table entry, SRD p.161), missileTypes
  (standard/smart/nuclear metadata: label + smart/nuclear behavior flags),
  missileRangeTurns (SRD Missile Launch Range table, p.156 — turns to impact by
  range, null at Adjacent/Close), screenTypes (meson/nuclear metadata, descriptive
  only — the mechanical effect is resolved by rollShipTriggerScreens()).
  Data-model enum `choices` (characteristics, weaponTypes, mounts,
  behaviorTypes) derive from these key lists — config.mjs + lang/en.json are
  the only places to touch when adding an enum value.

module/data/actor-data.mjs
  characteristicField(initial)   → { max, damage } SchemaField shared by all
                                    humanoid/creature characteristics.
  Imports computeCharacteristicDerived/computeWoundState from
    module/helpers/characteristics.mjs — shared by HumanoidData and CreatureData
    (previously duplicated per-class; deduped since both models have a
    `characteristics` SchemaField but don't share a base class; moved to its own
    file so it's unit-testable without a `foundry.*` global — see §2 helpers/).
  HumanoidData (base class, not directly registered)
    - characteristics: str/dex/end/int/edu/soc, each {max,damage}
    - psi: {value, damage}
    - credits
    - prepareDerivedData(): current/value/dm/isDamaged/isDown per characteristic
      (via computeCharacteristicDerived), hex-digit UPP string, PSI current/dm,
      wound state (via computeWoundState). 3 down ⇒ dead; 2 down + END=0 ⇒ dead;
      2 down ⇒ mortally; 1 down ⇒ seriously; any damage ⇒ lightly.
  CharacterData extends HumanoidData
    + age, career, terms, pension, gender, appearance (HTML), personalGoals (HTML),
      biography (HTML), notes (HTML)
  NpcData extends HumanoidData
    + notes only (no chargen fields)
  CreatureData (own TypeDataModel, not Humanoid)
    - characteristics: str/dex/end/int only (no edu/soc/psi)
    - armor, attackDice ("2d6"), attackType, instinct, pack, speed, behaviorType
      (enum: carnivore/herbivore/omnivore/scavenger/hijacker/intermittent/filter),
      notes
    - shares computeCharacteristicDerived/computeWoundState with HumanoidData
  ShipData
    - shipClass, displacement, hullPoints {value,max}, structurePoints {value,max},
      armor, jumpRating (0-6), maneuverRating (0-6), powerPlant (0-6),
      fuel {value,capacity}, cargoCapacity, cargoUsed, crewMin, credits,
      sensorsHits/mDriveHits/jDriveHits/powerPlantHits/bridgeHits/fuelHits/
      holdHits (each 0-3, space-combat subsystem damage tracks), notes
    - prepareDerivedData(): hardpoints = floor(displacement/100); fuelPerJump =
      jumpRating × displacement × 0.1; fuelPerMonth = powerPlant × displacement ×
      0.01; freeCargo = cargoCapacity − cargoUsed; isSmallCraft = displacement < 100
      (selects the Hit Location table column).
    - hullPoints/structurePoints have no `damage` field by design — hit
      resolution and the sheet's Apply Hit action decrement `value` directly.

module/data/item-data.mjs
  SkillData:      level (0-5), characteristic (incl. "psi"), psionic (bool), costPsi,
                   description
  WeaponData:     damage ("2d6"-style string), range, skill (name string, not a
                   reference), magazine, tl, cost, mass, description
  ArmorData:      protection, protectionLaser (nullable — null = same as protection),
                   skillRequired, tl, cost, mass, description
  EquipmentData:  tl, cost, mass, description
  AugmentData:    characteristic (nullable enum), bonus, tl, cost, description
                   (no `mass` field, unlike the other physical item types)
  ShipComponentData: componentType (free string, not enum), tonnage, powerRequired,
                   cost, weaponType (nullable enum, "" = not a weapon, incl. "missile"),
                   mount ("" / turret / bay), damage (dice string), hits (0-3 turret/bay
                   damage track), ammo (missiles-in-magazine or sand canisters — GM sets
                   the starting count by hand, no seed data), loaded (bool, initial true —
                   Reload Weapons System, SRD p.152: a missile/sandcaster "spends" itself
                   the instant it fires regardless of remaining ammo, and needs a
                   rollShipReloadWeapon() action before firing again; ignored by every
                   other weaponType), missileType (standard/smart/nuclear, only
                   meaningful when weaponType is "missile"), screenType (nullable enum
                   "" / meson / nuclear — independent of weaponType; screens aren't
                   weapons), description

module/documents/actor.mjs — CepheusActor
  prepareDerivedData(): for ships, sums itemTypes.shipComponent into usedTonnage /
    usedPower (not enforced against capacity — purely informational).
  getRollData(): exposes characteristics.<key>.{value,max,damage,current,dm} to
    Roll formulas / initiative ("2d6 + @characteristics.dex.dm" in system.json).
  findSkillByName / getSkillLevel(): unskilled use = -3, reduced by
    Jack-of-All-Trades level (min 0 penalty once JoT is high enough).
  rollCharacteristic(key): 2d6 + char.dm + woundPenalty → chat message.
  rollSkill(item, {characteristicKey, difficulty}): 2d6 + char.dm + skill.level +
    woundPenalty vs difficulty target; posts success/failure to chat.
  _promptDifficulty() / _promptRange(): promptSelect (helpers/dialogs.mjs)
    pickers for shift-click difficulty override / space-combat range band.
  All check-style rolls (rollSkill/rollAttack/rollPsionic/rollShipAttack) run
    through helpers/dice.mjs evaluateCheck() + formatCheckFlavor() — one
    implementation of the 2d6-vs-target mechanic and one chat-card format.
  rollAttack(weaponItem, {characteristicKey, difficulty, promptDifficulty}):
    infers STR (melee) vs DEX (ranged) from `range.startsWith("Melee")`; totals
    skill level (via getSkillLevel, so unskilled use is penalized) + char DM +
    wound penalty; rich chat flavor with color-coded success/fail.
  testPsionics(): 2d6 − terms served = PSI score (SRD psionic-strength test);
    writes system.psi.value, resets damage to 0.
  rollPsionic(skillItem, opts): validates PSI availability/cost, deducts cost as
    psi.damage, rolls PSI-dm + skill level vs difficulty.
  recoverPsi(amount): reduces psi.damage, floored at 0.
  rollDamage(weaponItem): rolls the weapon's damage string; bails gracefully (chat
    info message, no roll) if the damage field is descriptive text instead of a
    dice formula (e.g. "By grenade").
  rollCreatureAttack(): flat system.attackDice roll for creatures (no skill/DM
    math) — on the document, not the sheet, so macros can reach it.
  applyDamage(total) / healDamage(total): distributes damage across
    END→STR→DEX (damage) or DEX→STR→END (heal) in that priority order, respecting
    each characteristic's current remaining capacity.
  fullRecovery(): zeroes all characteristic damage.
  _notifyWoundState(): UI warning toast when wound state is seriously/mortally/dead.

  Ship combat (SRD Chapter 10, full hit-location system):
  rollShipInitiative({thrustAdvantage, tacticsEffect}): 2d6 + DM(+1 if greater
    Thrust than opponent) + Captain's Tactics-check Effect.
  rollShipAttack(componentItem, {range, skillLevel, dm}): Turret/Bay Weapons
    check vs the weapon-type × range difficulty (CEPHEUS.spaceCombat.attackDifficulty);
    refuses to fire if the component isn't a weapon, is disabled (hits≥2), or
    can't reach that range; applies the tier-1 tracking-damage DM-2 automatically.
  rollShipWeaponDamage(componentItem): rolls the component's damage formula
    (offensive sandcaster use gets a fixed 1-point "roll" — see §3).
  rollShipReloadWeapon(componentItem): Reload Weapons System (SRD p.152) —
    flips a "spent" missile launcher/sandcaster's `loaded` field back to true,
    provided ammo remains; refuses (with a chat/UI message) if already loaded
    or out of ammo. rollShipMissileLaunch/rollShipAttack(sandcaster)/
    rollShipFireSand all now gate on `loaded` and set it false on firing.
  applyShipDamage(rawDamage, {radiation}): `radiation` is now a string —
    "" (none) / "standard" (fusion/particle/nuclear-missile) / "meson" —
    not a boolean. Subtracts armor (skipped entirely for "meson", which SRD
    p.157 says ignores armor and always resolves on the internal Hit
    Location column), converts the result to single/double/triple hits via
    damageToHits(), rolls Hit Location once per hit (twice/thrice applied to
    the same location for double/triple hits per SRD), and resolves each:
    Hull/Structure/Armor decrement directly; Sensors/M-Drive/J-Drive/Power
    Plant/Bridge/Fuel/Hold increment a 0-3 ship-level tier track (fuel/hold
    tiers also roll and actually consume the tracked resource); Turret/Bay
    pick a random matching weapon component and increment its own 0-3 `hits`
    track; Crew rolls the Crew Damage table and reports the result for the
    GM to apply manually (no crew roster exists in this system). Hits beyond
    tier 3 redirect to Hull or Structure per the SRD's "Subsequent Hits"
    rule. Any non-empty `radiation` also triggers an automatic BONUS crew
    radiation hit (SRD p.157) — unconditional, unlike the Hit-Location-
    triggered crew hit above (which only produces a radiation-formula result
    if the roll happens to land on Crew) — with a -DM equal to the ship's
    armor for "standard", no DM for "meson". Posts one consolidated chat
    message per call.
  _resolveShipHitLocation / _applyShipMountHit / _rollShipCrewDamage(radiation,
    dm): internal orchestration helpers for the above — `dm` on
    _rollShipCrewDamage is only used by the bonus-hit call above, never by
    the ordinary Hit-Location-triggered path. _rollHitEvents(events, column,
    opts): extracted from applyShipDamage's roll-Hit-Location-per-event loop
    so rollShipBoardingRound() can reuse it against a forced "internal" column.

  Missiles/sand/screens/boarding (SRD p.155-157) — all resolved as further
  manual, chat-driven GM steps, matching every other ship-combat method above
  rather than introducing new automated/scheduled state:
  rollShipMissileLaunch(componentItem, {range,skillLevel,dm}): the launch
    check; converts Effect to an impact to-hit target via
    helpers/spacecombat.mjs missileToHitTarget(), consumes ammo (12/bay,
    1/turret) and sets `loaded:false` (Reload Weapons System, SRD p.152 —
    refuses to fire if already unloaded), and reports flight time
    (CEPHEUS.spaceCombat.missileRangeTurns) for the GM to track — no
    in-Foundry turn scheduler exists to auto-resolve the SRD's multi-turn
    missile flight.
  rollShipMissileImpact(componentItem, {toHitTarget,reactionDM,missileType}):
    the GM-triggered second step; smart missiles always need 8+; on a hit,
    calls rollShipWeaponDamage() (still a separate step from the target's own
    Apply Hit, like every other weapon).
  rollShipPointDefense(componentItem, {skillLevel,dm,attemptNumber}): Turret
    Weapons check to shoot down an inbound missile, cumulative DM-1 per
    consecutive attempt this round (SRD doesn't specify a difficulty for the
    check itself — treated as Average, a documented judgment call).
  rollShipFireSand(componentItem, {skillLevel,dm}): defensive sandcaster use,
    1 canister → 1D6 reduction against ONE incoming damage roll (the system
    already resolves a multi-weapon mount's damage as a single roll, so this
    doesn't attempt the SRD's per-beam granularity). Also sets `loaded:false`
    (Reload Weapons System). rollShipAttack() gates/consumes the same
    ammo+loaded state for offensive sandcaster use (checked before the
    range/difficulty prompt so an invalid-range attempt doesn't burn a
    canister); rollShipWeaponDamage() special-cases offensive sandcaster use
    as a fixed 1-point hit (SRD p.157) when no dice-formula damage is set,
    rather than bailing out.
  rollShipReloadWeapon(componentItem): significant action, sets
    `loaded:true` if ammo remains — see item-data.mjs's `loaded` field note
    above. Applies to missile launchers and sandcasters only.
  rollShipTriggerScreens(componentItem, {skillLevel}): 2D6+skill reduction,
    reported for the GM to subtract by hand on the next Apply Hit — same
    manual-compose-the-number convention as Fire Sand.
  rollShipBoardingRound({attackerDM,defenderDM,attackerLabel,defenderLabel}):
    Abstract Boarding Rules — called on the DEFENDING ship (both SRD outcome
    branches affect "the ship" being boarded). Opposed roll decides the
    winner; degree of success is read off the WINNER's own Effect (not the
    margin between the two rolls) per the SRD's general Opposed Checks rule.
    Regular Success → one Hit-Location-resolved hit on the internal column;
    Exceptional Success (attacker wins) → 2D6 raw damage through the same
    damageToHits()/_rollHitEvents() pipeline as a normal attack; Exceptional
    Success (defender wins) → narrative-only, no ship damage.

module/documents/item.mjs   (9 lines) — CepheusItem, currently just the bare
  subclass with no overrides (hook point for future item-level logic).

module/documents/combatant.mjs — CepheusCombatant: _getInitiativeFormula()
  returns flat "2d6" for ship actors (the global dex-based tracker formula
  can't apply — ships have no characteristics; situational SRD modifiers come
  from the ship sheet's Roll Initiative prompt instead).

module/helpers/dice.mjs — the canonical 2d6 pipeline. evaluateCheck({dm,
  difficulty}) rolls vs the difficulty table; formatCheckFlavor() builds the
  standard chat block (title — kind / muted detail / ✔✘ result, styled by
  cepheus-chat-* CSS classes, no inline styles); rollCheck() is the standalone
  macro-friendly wrapper. Pure, unit-tested string helpers:
  normalizeDiceFormula/isDiceFormula (seed data mixes "2D6"/"2d6"; some damage
  entries are descriptive text), signed() for DM formatting. Every check-style
  roll in actor.mjs runs through this module.

module/helpers/dialogs.mjs — single home for input dialogs: promptForm (typed
  field list → DialogV2, returns {name: value} or null), promptNumber,
  promptSelect. Labels pass through game.i18n.localize (unknown strings pass
  unchanged). All sheet/document prompts route through these.

module/helpers/form.mjs — preventEnterSubmit(): blocks the native Enter-key
  form submit that double-fires alongside submitOnChange autosave; wired by
  the base actor sheet's _onRender and the item sheet.

module/helpers/spacecombat.mjs — pure functions used by actor.mjs's ship-combat
  methods: damageToHits(damage) (Space Combat Damage table, SRD p.159),
  applyTieredHit(current, amount, max) (0-3 tier math with overflow reporting),
  missileToHitTarget(effect) (Missile To-Hit By Skill Check Effect table, p.156).

module/helpers/characteristics.mjs — computeCharacteristicDerived(characteristics)
  / computeWoundState(characteristics), extracted out of actor-data.mjs (which
  imports and uses them) specifically so they're importable and unit-testable
  without any `foundry.*` global — see tests/characteristics.test.mjs.

module/helpers/handlebars.mjs — registers: cepheusSign (± formatting), cepheusHex
  (0-15 → hex digit, used for UPP display), includes (array membership), array
  (build an inline array from template args, e.g. `(includes (array "a" "b") val)`
  — used by the ship components table to gate buttons on multiple weaponTypes
  at once), keys (Object.keys, used in chargen skill tables), inc (1-based @index).
```

### Sheets

All four actor sheets extend a shared base; templates read actor data as
`{{system.x}}` (the base passes `this.actor.system` into context) rather than
sheets re-flattening fields.

```
module/sheets/base-actor-sheet.mjs — CepheusBaseActorSheet (shared base)
  Owns: _getTabs() driven by each subclass's static TABS list (labels resolve
  to CEPHEUS.Tab<Id>; first entry = initial tab), _preparePartContext tab
  wiring, _prepareContext (tabs + system), _onRender → preventEnterSubmit,
  form.submitOnChange, and the actions identical across actor types:
  createItem (data-type attr), editItem, deleteItem, applyDamage, healDamage
  (promptNumber dialogs), fullRecovery.

module/sheets/actor-sheet.mjs — CepheusActorSheet (character) extends base
  PARTS: header, tabs, characteristics, skills, equipment, biography, notes.
  Own actions: startChargen, rollCharacteristic, rollSkill, rollAttack,
  rollDamage, rollPsionic, testPsionics, recoverPsi.
  Context adds itemTypes lists (skills/weapons/armor/equipment/augments),
  charConfig, and isCharacter — header.hbs gates the chargen button on it
  (the template is shared with NPCs, whose schema lacks chargen fields).

module/sheets/npc-sheet.mjs — CepheusNpcSheet extends CepheusActorSheet.
  Overrides PARTS (drops biography, npc-specific notes), TABS, classes,
  position — nothing else; all handlers and context inherited.

module/sheets/creature-sheet.mjs — CepheusCreatureSheet extends base
  PARTS: header, tabs, stats, notes. Own action: rollAttack → delegates to
  actor.rollCreatureAttack(). Damage/heal/recovery come from the base.

module/sheets/ship-sheet.mjs — CepheusShipSheet extends base
  PARTS: header, tabs, statistics, components, notes.
  Own actions: rollInitiative, rollAttack, rollWeaponDamage, applyShipHit,
  adjustSystemHit, adjustMountHit, launchMissile, resolveMissileImpact,
  pointDefense, fireSand, triggerScreens, boardingAction, reloadWeapon.
  rollInitiative/applyShipHit/resolveMissileImpact/pointDefense/fireSand/
  triggerScreens/boardingAction all use promptForm (single-field or small
  multi-field dialogs — the GM enters skill+DM combined as one number for
  point defense and fire sand, matching the existing tacticsEffect-as-one-
  number pattern) then delegate to the matching CepheusActor method.
  applyShipHit's dialog now has radiation as a 3-way select
  (none/standard/meson) instead of a checkbox — see actor.mjs's
  applyShipDamage note above. launchMissile/reloadWeapon take no dialog
  beyond the shared _promptRange picker for launchMissile (mirrors
  rollAttack's minimalism — skillLevel/dm default to 0, same gap as every
  other ship weapon roll from this sheet). resolveMissileImpact/launchMissile
  read missileType off the component item directly rather than re-prompting
  for it. The Add Component button uses the base createItem with
  data-type="shipComponent". systemHitRows derive from
  CEPHEUS.spaceCombat.subsystems keys + locationLabels — adding a subsystem
  needs only a config entry and a <key>Hits schema field. Components table
  gates action buttons per row on weaponType/mount/screenType: missile
  launchers get Launch/Resolve Impact instead of Attack/Damage; missile
  launchers and sandcasters both additionally get Reload; sandcasters also
  get Fire Sand; turret-mounted pulse/beam lasers get Point Defense; any
  screenType gets Trigger Screens. Ammo is shown read-only in the table
  (edited via the item sheet) for missile/sandcaster components, with a
  "SPENT" tag (`.spent-tag` in cepheus.css) when `loaded` is false.

module/sheets/item-sheet.mjs — CepheusItemSheet, one sheet class for
  all 6 item types; body.hbs branches per itemType. rollAttack/rollDamage actions
  delegate to the owning actor if the item is embedded. (Own hierarchy —
  ItemSheetV2, not the actor base — but same submitOnChange/preventEnterSubmit
  wiring.) shipComponent fields now also expose missileType (shown only when
  weaponType is "missile"), ammo + loaded (shown together for missile/
  sandcaster weaponTypes via a precomputed showAmmo context boolean), and
  screenType (always shown, independent of weaponType).

module/apps/chargen.mjs   (491 lines) — CepheusChargenApp (ApplicationV2)
  Full lifepath wizard, steps: characteristics → career → terms (loop) →
  musterout → review/apply.
  - Characteristics: auto-rolled before first render (free), then a shared
    3-reroll pool covers individual rerolls and Reroll All; no manual entry.
    UPP key list (CHAR_KEYS) and abbreviations derive from config.mjs.
  - Career: select from CAREERS, roll qualification (auto-pass for Drifter),
    fail-forward into Drifter on a failed qualification roll.
  - Per term: survival roll (failure ends career immediately, still counts the
    term) → skill picks (2 rolls/term for the 7 no-advancement careers, else 1,
    +1 bonus specialist pick on commission) → commission roll (once, before first
    advancement roll) → advancement roll (rank increase + rank skill) →
    reenlistment roll (natural 12 forces another term even past the 7-term cap;
    failure forces muster-out; 7th term forces retirement barring the nat-12
    exception; otherwise player's choice via nextTerm/endCareer actions).
  - _applySkillEntry: parses "+N CHAR" as a characteristic bonus, otherwise
    increments a running per-skill pick counter (first pick → level 0, each
    subsequent pick → +1), matching SRD skill-table rules.
  - Muster-out: 1D6 rolls against career cash/benefit tables, capped at 3 cash
    rolls per character; characteristic-boost benefits feed back into
    charBonuses.
  - Pension: terms ≥5 → Cr10,000 + Cr2,000 per term beyond 5 (SRD p.30).
  - Apply: writes final characteristics (base + bonuses, clamped 1-15, damage
    reset to 0), credits, age (18 + terms×4), pension, career name/terms,
    gender/appearance/personalGoals (read directly from rendered inputs —
    chargen.hbs has no <form> wrapper, noted in-code), a generated biography
    paragraph, and creates/merges skill items (merging correctly accounts for
    pre-existing skill levels — verified not a double-count bug, see review
    notes).
```

### Templates (`templates/`)

All `systems/cepheus-engine/templates/...` paths referenced in code were verified
to exist on disk (no dangling references as of last review).

```
actor/header.hbs, characteristics.hbs, skills.hbs, equipment.hbs, biography.hbs,
  notes.hbs                          — character (also reused by npc where noted)
actor/npc/notes.hbs                  — npc-specific notes tab
actor/creature/header.hbs, stats.hbs, notes.hbs
actor/ship/header.hbs, statistics.hbs, components.hbs, notes.hbs
apps/chargen.hbs                     — single-file wizard UI, all steps
item/header.hbs, body.hbs            — body.hbs branches per item type
```

`templates/generic/tab-navigation.hbs` referenced with no `systems/...` prefix —
that's intentional, it's Foundry core's shared tab-nav partial, not a project file.

### Compendia (`packs/`)

LevelDB-format packs (LOCK/LOG/CURRENT/MANIFEST — normal for Foundry v11+, but
means the repo has no diffable JSON source for pack contents; the seed files in
`module/data/seeds/*.mjs` are the real source of truth and get pushed into these
packs on first `ready` hook if the pack is empty).

| Pack        | Seed file                     | Count |
|-------------|--------------------------------|-------|
| skills      | module/data/seeds/skills.mjs   | 73 (incl. 5 psionic talents: Awareness, Clairvoyance, Telekinesis, Telepathy, Teleportation) |
| weapons     | module/data/seeds/weapons.mjs  | 39 |
| armor       | module/data/seeds/armor.mjs    | 9 |
| equipment   | module/data/seeds/equipment.mjs| 121 |
| augments    | module/data/seeds/augments.mjs | 12 (homebrew — no SRD source table for cybernetics/bio-augments, see below) |
| tables      | module/data/seeds/tables.mjs   | 16 RollTables, direct SRD transcriptions: Random Encounters (D66, p.187), Patron Encounters (D66, p.188), Random Rumor Content (D66, pp.190-191), Starship Encounters (2D6, p.193), 10 "X Encounter Type" sub-tables (1D6 each, pp.193-195 — Alien Vessel/Astrogation/Derelict/Hostile Vessel/Merchant Vessel/Military Vessel/Personal Vessel/Spacecraft/Space Habitat/Space Junk), Animal Encounter 1D6 Template (p.183), Animal Encounter 2D6 Template (p.184). D66 uses formula `(1d6*10)+1d6`. Starship Encounters' 10 vessel-type results (all but "Referee's Choice") are `type:"document"` chained references (via `tableResults()`), each carrying a `documentUuid` resolved by `seed-sync.mjs`'s `resolveTableReferences()` once every table in the pack exists. Foundry's own `RollTable#draw()` auto-follows a `type:"document"` result into the RollTable it references (confirmed live against v14 build 367) — no system-side chaining code needed; a bare `table.draw()` (used by the "Roll on Table" macro) is enough. **Migration note:** `syncPack()` only adds entries missing *by name* (§2 seed-sync.mjs) — it never rewrites an already-existing document, so a world that ran an earlier system version (pre this pass) keeps its old, non-chaining "Starship Encounters" table forever after upgrading; only the 10 new sub-tables (new names) get added to it. A GM on such a world has to delete and let it re-seed (or edit it by hand) to get chaining. |
| macros      | module/data/seeds/macros.mjs   | 6 script macros (scope "global", most operate on `canvas.tokens.controlled`): Roll on Table (prompts a table from the `tables` pack, calls a bare `table.draw()` — chaining is native to Foundry, see the `tables` row above), Apply Damage to Selected, Heal Selected, Roll Ship Initiative, Full Recovery (Selected), Create Campaign Folders (`game.cepheus.createCampaignFolders()` — re-run of the default folder seeding from §2's folder-seed.mjs). |

### Career data (`module/data/careers.mjs`, 523 lines)

24 careers transcribed from SRD pp.33-40, each with: qualification/survival/
commission/advancement targets (char + target number), reenlistment target,
rank titles (7 ranks), rank skills, 4 skill tables (personal/service/specialist/
advanced), cash table (6 entries), benefits table (6 entries). Extensive in-code
comments document two known SRD table transcription oddities (a "Perception" and
two "Prospecting" entries with no matching skill, mapped to the closest real
skill) and the rationale for treating cascade skills as their generic name.

Full list: Aerospace System Defense, Agent, Athlete, Barbarian, Belter,
Bureaucrat, Colonist, Diplomat, Drifter, Entertainer, Hunter, Marine, Maritime
System Defense, Mercenary, Merchant, Navy, Noble, Physician, Pirate, Rogue,
Scientist, Scout, Surface System Defense, Technician.

### Localization (`lang/en.json`)

193 keys under `TYPES.*` and `CEPHEUS.*`. Verified complete against every
literal `{{localize "CEPHEUS.X"}}` call in templates/JS — no missing keys as of
last review (dynamic keys like `CEPHEUS.Tab${id}` / `CEPHEUS.Wound${state}` were
checked by hand against their possible expansions and all resolve). Chat-message
flavor text built in JS (actor.mjs's roll methods, ship-combat subsystem effect
descriptions in config.mjs) intentionally uses hardcoded English strings rather
than localization keys, matching the pre-existing convention for that layer —
only template-rendered UI text and dialog labels go through `lang/en.json`.

### Tests (`tests/`, run via `bun test`)

101 tests, no test dependencies beyond the `bun` binary itself (`bun:test` is
built in). `bunfig.toml` preloads `tests/setup.mjs`, which stubs only
`Math.clamp` and `CONFIG.CEPHEUS` (imported from the real config.mjs, not
duplicated) — the minimal slice of the Foundry runtime the pure-logic modules
need. Nothing touching `foundry.abstract`, `Actor`/`Item` documents, sheets,
`Roll`/`ChatMessage`/`DialogV2`, or `chargen.mjs` is covered — that would
require a live Foundry environment or a much heavier mock and is out of scope
for this suite (see Known Issue 1 re: not yet exercised live).

```
tests/setup.mjs               Preload: Math.clamp polyfill + CONFIG.CEPHEUS stub.
tests/spacecombat.test.mjs    damageToHits() against every SRD Space Combat
                               Damage table boundary; applyTieredHit() overflow math;
                               missileToHitTarget() against every Effect bracket.
tests/dice.test.mjs           normalizeDiceFormula/isDiceFormula (case/whitespace,
                               descriptive-text rejection) and signed() formatting.
tests/characteristics.test.mjs computeCharacteristicDerived()/computeWoundState()
                               against hand-built characteristic objects — DM table
                               edges, all 5 wound-state tiers.
tests/careers.test.mjs        Structural sanity on all 24 CAREERS entries (valid
                               characteristic keys, 7-entry rankTitles, 6-entry
                               cash/benefits, no-commission careers have null
                               commission/advancement per SRD p.29).
tests/seeds.test.mjs          Item-pack seed counts (73/39/9/121/12) and shape;
                               TABLES_SEED D66/2D6 range coverage (no gaps/overlaps);
                               MACROS_SEED command strings parse as valid JS.
tests/localization.test.mjs   Every statically-referenced `CEPHEUS.*` localize key
                               (across templates/*.hbs and module/**/*.mjs) exists
                               in lang/en.json; every system.json documentType has
                               a TYPES label. Dynamic keys (template-literal built)
                               are skipped — same caveat as the manual verification
                               this replaces.
```

---

## 3. Core mechanics reference (as implemented, not just as spec'd)

- **Task resolution:** `2d6 + skill.level + characteristic.dm + woundPenalty ≥ difficulty.target`.
  Unskilled use = −3 (reduced toward 0 by Jack-of-All-Trades level).
- **Wound penalty:** 0 healthy, −1 lightly wounded, −2 seriously/mortally wounded — applied
  automatically inside rollCharacteristic/rollSkill/rollAttack/rollPsionic.
- **DM table:** value 0-1→−3, 2-2→−2 *(actually index-based, see `dmByValue` array —
  index = clamped characteristic value 0-15)*: `[-3,-2,-2,-1,-1,-1,0,0,0,1,1,1,2,2,2,2]`.
- **Psionics:** PSI pool = 2d6 − terms served (min 0) via testPsionics; each power use
  costs `skill.system.costPsi` PSI, tracked as psi.damage; psi.dm derives from *current*
  (post-spend) PSI, so spending reduces future roll quality within the same pool.
- **Ships:** hardpoints = ⌊displacement/100⌋; fuel/jump = jumpRating × 10% displacement;
  fuel/month = powerPlant × 1% displacement; component tonnage/power usage summed but not
  capacity-enforced (no validation error if you overfit a hull).
- **Space combat (SRD ch.10):** raw weapon damage − ship armor → Space Combat Damage
  table → N single/double/triple hits → one 2D6 Hit Location roll per hit (column by
  Hull>0/=0/isSmallCraft) → effect applied (Hull/Structure/Armor decrement; Sensors/
  M-Drive/J-Drive/Power Plant/Bridge/Fuel/Hold 0-3 tier tracks with SRD effect text;
  Turret/Bay hits land on a random matching weapon component's own 0-3 track; Crew
  hits roll the Crew Damage table for manual GM application). Hits beyond tier 3
  redirect to Hull or Structure per the SRD. One damage-table interpretation is a
  documented judgment call: see the comment in `module/helpers/spacecombat.mjs`
  `damageToHits()` for damage >44 (the SRD text is ambiguous about compounding there).
- **Missiles (SRD p.156-157):** two-step, GM-tracked flight time (no in-Foundry turn scheduler) —
  launch check (Effect → impact to-hit target via `missileToHitTarget()`) now, impact check
  later. Standard/Nuclear damage per the GM-entered `damage` field on the component; Smart
  always needs 8+ and may be re-triggered turn after turn. Point Defense (turret pulse/beam
  lasers only) attempts to shoot missiles down first, cumulative DM-1 per attempt.
  **Judgment call:** the SRD's Attack Difficulties table (p.149) doesn't list missiles at all —
  treated as flat Average(+0) at every range they can fire (Short/Medium/Long/Very Long/Distant;
  never Adjacent/Close), documented in `CEPHEUS.spaceCombat.attackDifficulty.missile`. Point
  Defense's check difficulty is equally unstated in the SRD and gets the same treatment.
- **Sand (SRD p.130, 155, 157):** offensive Close-range use is a fixed 1 point of damage (not a
  dice formula) — `rollShipWeaponDamage()` special-cases this. Defensive Fire Sand reduces one
  incoming damage roll by 1D6 per canister; the SRD's "resolve each beam separately" per-beam
  granularity isn't modeled since this system already collapses a multi-weapon mount's damage
  into a single roll.
- **Screens (SRD p.131, 155):** Trigger Screens rolls 2D6 + Screens skill as a damage reduction
  figure the GM subtracts by hand on the next Apply Hit (same manual-compose-the-number flow as
  Fire Sand) — nuclear dampers also flag that the automatic radiation hit from nuclear missiles
  should be waived.
- **Boarding actions (SRD p.155-156, Abstract Boarding Rules):** opposed roll on the defending
  ship's actor; winner determined by highest total, degree of success read off the *winner's own*
  Effect (roll + DM − 8) per the SRD's general Opposed Checks + Degrees of Success rules — not
  the margin between the two rolls. Regular Success on either side → one Hit-Location-resolved
  internal hit; Exceptional Success (attacker wins) → 2D6 raw internal damage through the normal
  damage-to-hits pipeline; Exceptional Success (defender wins) → narrative outcome only, no
  ship damage.
- **Reload Weapons System (SRD p.152):** missile launchers and sandcasters now track a `loaded`
  boolean independent of `ammo` — firing sets it false regardless of remaining ammo (a
  launcher can be fully stocked and still need reloading), and `rollShipReloadWeapon()` is a
  new significant action that sets it back to true if ammo remains. Like every other
  ship-combat action here, the minor/significant action economy itself isn't tracked or
  enforced (SRD p.150's per-turn action budget) — this only gates on `loaded`/`ammo`, not on
  how many actions the crew has spent this turn.
- **Bonus radiation crew hit (SRD p.157 Special Weapon Rules):** `applyShipDamage`'s
  `radiation` option changed from a boolean to a 3-way string ("" / "standard" / "meson").
  Any non-empty value now triggers an automatic bonus Crew Damage roll *in addition to* normal
  damage — previously the `radiation` flag only changed what an *ordinary* Hit-Location roll
  produced if it happened to land on Crew, which underused the "in addition to" wording and
  skipped the bonus hit's own -DM(armor) penalty entirely. "standard" (fusion/particle/nuclear
  missile) applies -DM equal to the ship's armor to that bonus roll; "meson" does not, and also
  now bypasses armor entirely for the primary damage and always resolves on the internal Hit
  Location column, per the SRD's "meson guns ignore armor... always roll on the Internal Damage
  table."

---

## 4. Known issues (unfixed as of last review)

1. **No system background image.** `assets/background.jpg` (a "burning astronaut" wallpaper of
   unverified origin/license) was removed from `system.json` and gitignored rather than shipped
   with unclear rights — needs a real replacement (original art, a properly licensed image, or
   confirmed permission) before `background` is set again.

Resolved 2026-08-18 (ship component capacity — warn, don't block): added `isOverTonnage`/
`isOverPower` derived booleans on `ShipData` (actor.mjs's `prepareDerivedData`, alongside the
existing `usedTonnage`/`usedPower` sums), comparing against `displacement` and `powerPlant`
respectively. `powerPlant`'s 0-6 rating is treated as the power budget directly (matches how
`powerRequired` is already entered by hand per component; no new SRD-external formula
introduced). The Components tab now shows both totals as "used / capacity" and highlights
either in red with a warning icon when exceeded (`.over-capacity` in cepheus.css,
`CEPHEUS.OverCapacity` in lang/en.json) — deliberately a soft warning, not a hard block, so a
GM can still knowingly build an over-budget ship.

Resolved 2026-08-18 (first live Foundry v14 session — three release-blocking bugs found and
fixed, none of which static review had caught):
- **Every actor sheet rendered blank below the header, on every actor type.** `_getTabs()`
  (base-actor-sheet.mjs) computes an `active`/`cssClass` per tab, consumed correctly by
  `templates/generic/tab-navigation.hbs` for the nav — but none of the 11 tab-content
  templates (characteristics/skills/equipment/biography/notes × character/npc/creature/ship)
  ever applied that class to their own `<section class="tab ...">`. Foundry core CSS hides
  any `.tab` without `.active`, so no tab body was ever visible. Fixed by adding
  `{{tab.cssClass}}` to each section's class list.
- **`system.characteristics` silently emptied on every data-prep cycle for character/npc/
  creature actors** (ships unaffected). `CepheusActor#getRollData()` called
  `super.getRollData()`, which — per Foundry's own documented warning — returns `this.system`
  *by reference*, not a copy. The override then did `data.characteristics = {}` before
  reading from `sys.characteristics` in the same loop; since `data`/`sys`/`this.system` were
  all the same object, that line wiped the live characteristics first, so the loop iterated
  zero entries. Foundry calls `getRollData()` from `applyActiveEffects("initial")`, which runs
  before the data model's own `prepareDerivedData()` on every single prepare cycle — so this
  reproduced on a bare `Actor.create()` with no chargen involved, on every load. Persisted
  data (`_source`) was never affected, only the in-memory prepared model. Fixed by
  shallow-copying `super.getRollData()` before mutating.
- **Chargen's Step 1 showed all-zero characteristics on first open**, despite claiming
  "rolled automatically" and logging as much. `ApplicationV2#render()` calls
  `_prepareContext()` *before* `_preFirstRender()` (confirmed against Foundry's own source),
  so a roll performed in `_preFirstRender` always arrives one context-snapshot too late for
  the first paint. Fixed by moving the auto-roll into `_prepareContext()` itself, guarded by
  the existing `_autoRolled` flag.

All three were caught only by actually driving a live Foundry v14 session (world creation,
chargen, ship combat) via a scripted Playwright harness — static review and `bun test` (which
can't touch `foundry.abstract`/sheets/chargen, see §2 tests/) had no way to catch any of them.
Also fixed in the same pass: a stale `systems/cepheus-engine` symlink on the dev machine
pointing at a nonexistent path.

Resolved 2026-07-26 (structural-consistency pass): duplicated sheet plumbing
(four sheets now share CepheusBaseActorSheet), eight hand-rolled DialogV2
prompts (helpers/dialogs.mjs; macros use the game.cepheus API), five parallel
implementations of the 2d6 check + inline-styled chat HTML (helpers/dice.mjs +
cepheus-chat-* classes), enum choices duplicated between config and schemas,
the dual subsystem label systems (locationLabels i18n keys are now the single
source), creature attack living on the sheet, flattened-vs-system context
conventions, the ungated chargen button on NPC sheets, ships hitting the
dex-based tracker formula (CepheusCombatant), and skills-only pack patching
(syncPack covers all seven packs).

Resolved since the last review (2026-07-08 → 2026-07-09): ship damage buttons
writing a nonexistent schema field, augments being unreachable from actor sheets,
no augment compendium content, no version control, duplicated wound-state logic
between HumanoidData/CreatureData, no ship-to-ship combat resolution beyond manual
damage-number entry, no macro/rollable-table content, and no automated tests. See
`git log` for details.

---

## 5. Not yet started

- Regions-based AoE tooling (CLAUDE.md notes Measured Templates are removed in v14 in
  favor of Regions — nothing in the system currently uses either, presumably not needed
  yet given no template-based weapons/powers exist). Deliberately not scaffolded
  speculatively — there's no concrete weapon/power to attach it to yet, and generic
  "Regions tooling" with no real use case would be unbuildable-in-any-testable-way and
  likely wrong for whatever the actual first use case turns out to be. Revisit when
  something needs it.

Resolved 2026-08-18 (same day, fourth follow-up — Reload Weapons System + bonus radiation
hit): both items previously listed here are now implemented; see §2's item-data.mjs/
actor.mjs/ship-sheet.mjs entries and §3's dedicated bullets for what changed. Note the
`radiation` parameter on `applyShipDamage()` changed shape (boolean → 3-way string) as
part of this — a real, deliberate behavior change to code that shipped in v0.2.0, not
just new code.

---

## 6. How to regenerate/verify this file

This file is a manually-curated snapshot, not generated. To refresh it:
1. Re-run the file inventory (`find . -type f -not -path './.git/*'`).
2. Re-diff localization keys used in templates/JS against `lang/en.json`.
3. Re-check the flagged issues above against current code before assuming they're
   still open, and check `git log` for changes since the "Last reviewed" date.
4. Update the "Last reviewed" date at the top.
