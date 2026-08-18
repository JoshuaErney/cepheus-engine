import { FOLDER_SEED } from "./seeds/folders.mjs";

const SEEDED_FLAG = "campaignFoldersSeeded";

// Hidden world-scope flag gating the one-time auto-seed on a world's first
// `ready`. Not shown in the Settings UI — there's nothing for a GM to
// configure, it's just bookkeeping so returning to an already-organized
// world doesn't re-run anything.
export function registerFolderSeedSetting() {
  game.settings.register("cepheus-engine", SEEDED_FLAG, {
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });
}

// Runs ensureCampaignFolders() exactly once per world. Safe to call on every
// `ready` — after the first run the flag short-circuits it.
export async function seedCampaignFoldersOnce() {
  if (game.settings.get("cepheus-engine", SEEDED_FLAG)) return;
  await ensureCampaignFolders();
  await game.settings.set("cepheus-engine", SEEDED_FLAG, true);
}

// Creates any folder in FOLDER_SEED missing from this world, matched by
// name + type + parent. Existing folders (renamed, recolored, relocated, or
// left alone) are never touched, and folders a GM has deliberately deleted
// are NOT resurrected by the automatic once-per-world call above — but this
// function itself is exported and idempotent, so re-running it on demand
// (e.g. via the "Create Campaign Folders" macro) safely fills in anything
// missing without duplicating what's already there.
export async function ensureCampaignFolders() {
  for (const [type, tree] of Object.entries(FOLDER_SEED)) {
    await createMissing(type, tree, null);
  }
}

async function createMissing(type, nodes, parentId) {
  const existing = game.folders.filter(f => f.type === type && folderParentId(f) === parentId);
  const byName = new Map(existing.map(f => [f.name, f]));

  for (const node of nodes) {
    let folder = byName.get(node.name);
    if (!folder) {
      folder = await Folder.create({
        name: node.name,
        type,
        folder: parentId,
        color: node.color ?? null,
        sorting: "a",
      });
    }
    if (node.children?.length) await createMissing(type, node.children, folder.id);
  }
}

function folderParentId(folder) {
  const parent = folder.folder;
  if (!parent) return null;
  return typeof parent === "string" ? parent : parent.id;
}
