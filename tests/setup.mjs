// Preloaded before every test file (see bunfig.toml). Provides the minimal
// slice of the Foundry VTT runtime that pure-logic helper modules rely on —
// NOT a general Foundry mock. Modules that touch `foundry.abstract`,
// `foundry.data.fields`, `Actor`, `Item`, `Roll`, `ChatMessage`, `DialogV2`,
// etc. are integration-level and out of scope for this suite; see
// PROJECT_STATUS.md for what's covered.
import { CEPHEUS } from "../module/config/config.mjs";

globalThis.CONFIG = { CEPHEUS };

// Foundry extends the built-in Math object with a clamp() helper.
if (typeof Math.clamp !== "function") {
  Math.clamp = (value, min, max) => Math.min(Math.max(value, min), max);
}
