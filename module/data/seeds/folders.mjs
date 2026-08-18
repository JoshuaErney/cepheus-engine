// Default campaign folder structure, created once in every new world (see
// ensureCampaignFolders() in ../folder-seed.mjs) and re-runnable at any time
// via the "Create Campaign Folders" macro. Keyed by Folder#type (the Foundry
// document types that support folders); each node may nest further folders
// via `children`. Matched against existing folders by name at seed time, so
// this is data only — no document creation happens here.

export const FOLDER_SEED = {
  Actor: [
    { name: "Player Characters", color: "#2f7d6e" },
    {
      name: "NPCs", color: "#b8860b",
      children: [
        { name: "Patrons" },
        { name: "Allies & Contacts" },
        { name: "Antagonists" },
      ],
    },
    { name: "Creatures & Wildlife", color: "#6b4226" },
    { name: "Ships & Vehicles", color: "#3a5a8c" },
  ],

  Item: [
    {
      name: "Homebrew Gear", color: "#7a4fa3",
      children: [
        { name: "Weapons" },
        { name: "Armor" },
        { name: "Equipment" },
        { name: "Augments" },
      ],
    },
    { name: "Custom Skills", color: "#2f6f9f" },
  ],

  JournalEntry: [
    { name: "Session Notes", color: "#4a7c59" },
    {
      name: "Setting Reference", color: "#c9a227",
      children: [
        { name: "Sector & Subsector Data" },
        { name: "Worlds & Systems" },
      ],
    },
    {
      name: "Story & NPCs", color: "#a4462f",
      children: [
        { name: "Patrons & Plot Hooks" },
        { name: "Factions & NPC Dossiers" },
      ],
    },
    { name: "Player Handouts", color: "#3a5a8c" },
    { name: "House Rules", color: "#616161" },
  ],

  Scene: [
    { name: "Starports", color: "#3a5a8c" },
    { name: "Planetside", color: "#4a7c59" },
    { name: "Ship Interiors", color: "#7a4fa3" },
    { name: "Space Encounters", color: "#1f3a5f" },
  ],

  RollTable: [
    { name: "Homebrew Tables", color: "#c9a227" },
  ],
};
