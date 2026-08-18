// Ready-to-use macros exercising CepheusActor's roll/damage/table-draw
// methods, so GMs don't have to write their own scripts from scratch. Drag
// these from the compendium onto the hotbar.

export const MACROS_SEED = [
  {
    name: "Roll on Table",
    type: "script",
    scope: "global",
    img: "icons/svg/d20-highlight.svg",
    command: `
const pack = game.packs.get("cepheus-engine.tables");
if (!pack) return ui.notifications.warn("Cepheus Engine tables compendium not found.");
const tables = await pack.getDocuments();
if (!tables.length) return ui.notifications.warn("No tables found in the compendium.");

const options = tables.map(t => \`<option value="\${t.id}">\${t.name}</option>\`).join("");
const { DialogV2 } = foundry.applications.api;
const tableId = await DialogV2.prompt({
  window: { title: "Roll on Table" },
  content: \`<div class="form-group"><label>Table</label><select name="table">\${options}</select></div>\`,
  ok: { label: "Roll", callback: (event, button) => button.form.elements.table.value },
});
if (!tableId) return;

const table = tables.find(t => t.id === tableId);
// Chains automatically into a matching sub-table when the draw lands on one
// (e.g. Starship Encounters -> the matching "X Encounter Type" table) — see
// game.cepheus.drawTableChained().
await game.cepheus.drawTableChained(table);
`.trim(),
  },
  {
    name: "Apply Damage to Selected",
    type: "script",
    scope: "global",
    img: "icons/svg/blood.svg",
    command: `
const amount = await game.cepheus.promptNumber({ title: "Apply Damage", label: "Damage amount" });
if (!amount || amount <= 0) return;

const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Select one or more tokens first.");

for (const token of tokens) {
  const actor = token.actor;
  if (!actor) continue;
  if (actor.type === "ship") await actor.applyShipDamage(amount);
  else await actor.applyDamage(amount);
}
`.trim(),
  },
  {
    name: "Heal Selected",
    type: "script",
    scope: "global",
    img: "icons/svg/heal.svg",
    command: `
const amount = await game.cepheus.promptNumber({ title: "Heal Damage", label: "Amount to heal", initial: 1, min: 1, okLabel: "Heal" });
if (!amount || amount <= 0) return;

const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Select one or more tokens first.");

for (const token of tokens) {
  const actor = token.actor;
  if (!actor || actor.type === "ship") continue;
  await actor.healDamage(amount);
}
`.trim(),
  },
  {
    name: "Roll Ship Initiative",
    type: "script",
    scope: "global",
    img: "icons/svg/dice-target.svg",
    command: `
const tokens = canvas.tokens.controlled.filter(t => t.actor?.type === "ship");
if (!tokens.length) return ui.notifications.warn("Select one or more ship tokens first.");

for (const token of tokens) await token.actor.rollShipInitiative();
`.trim(),
  },
  {
    name: "Full Recovery (Selected)",
    type: "script",
    scope: "global",
    img: "icons/svg/regen.svg",
    command: `
const tokens = canvas.tokens.controlled;
if (!tokens.length) return ui.notifications.warn("Select one or more tokens first.");

for (const token of tokens) {
  const actor = token.actor;
  if (!actor || actor.type === "ship") continue;
  await actor.fullRecovery();
}
`.trim(),
  },
  {
    name: "Create Campaign Folders",
    type: "script",
    scope: "global",
    img: "icons/svg/chest.svg",
    command: `
if (!game.user.isGM) return ui.notifications.warn("Only the GM can create campaign folders.");
await game.cepheus.createCampaignFolders();
ui.notifications.info("Campaign folders created (existing folders were left untouched).");
`.trim(),
  },
];
