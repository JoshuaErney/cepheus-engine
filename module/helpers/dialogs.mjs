// Single home for the small input dialogs used by sheets, documents, and
// macros — build prompts with these instead of hand-rolling DialogV2 content.
// Titles, labels, and option labels pass through game.i18n.localize(), which
// returns unknown strings unchanged, so callers may supply either i18n keys
// or already-final text.

function loc(value) {
  return value ? game.i18n.localize(value) : "";
}

// field: { type: "number"|"checkbox"|"select", name, label, value, min, checked, options, selected }
function renderField(field, autofocus) {
  const focus = autofocus ? "autofocus" : "";
  switch (field.type) {
    case "checkbox":
      return `<div class="form-group"><label><input type="checkbox" name="${field.name}" ${field.checked ? "checked" : ""} /> ${loc(field.label)}</label></div>`;
    case "select": {
      const opts = Object.entries(field.options)
        .map(([value, label]) =>
          `<option value="${value}" ${value === field.selected ? "selected" : ""}>${loc(label)}</option>`)
        .join("");
      return `<div class="form-group"><label>${loc(field.label)}</label><select name="${field.name}" ${focus}>${opts}</select></div>`;
    }
    case "number":
    default: {
      const min = field.min !== undefined ? `min="${field.min}"` : "";
      return `<div class="form-group"><label>${loc(field.label)}</label><input type="number" name="${field.name}" value="${field.value ?? 0}" ${min} ${focus} /></div>`;
    }
  }
}

function readField(field, elements) {
  const el = elements[field.name];
  if (field.type === "checkbox") return el.checked;
  if (field.type === "select") return el.value;
  return Number.isFinite(el.valueAsNumber) ? el.valueAsNumber : 0;
}

// Multi-field prompt. Resolves to { name: value } per field, or null if dismissed.
export async function promptForm({ title, okLabel = "CEPHEUS.Apply", fields }) {
  const { DialogV2 } = foundry.applications.api;
  const content = fields
    .map((field, i) => renderField(field, i === 0 && field.type !== "checkbox"))
    .join("");
  return DialogV2.prompt({
    window: { title: loc(title) },
    content,
    ok: {
      label: loc(okLabel),
      callback: (event, button) =>
        Object.fromEntries(fields.map(f => [f.name, readField(f, button.form.elements)])),
    },
  });
}

// Single numeric input. Resolves to the number, or null if dismissed.
export async function promptNumber({ title, label, initial = 0, min = 0, okLabel = "CEPHEUS.Apply" }) {
  const result = await promptForm({
    title, okLabel,
    fields: [{ type: "number", name: "value", label, value: initial, min }],
  });
  return result ? result.value : null;
}

// Single select box over a { value: label } map. Resolves to the chosen value,
// or null if dismissed.
export async function promptSelect({ title, label, choices, selected, okLabel = "CEPHEUS.Apply" }) {
  const result = await promptForm({
    title, okLabel,
    fields: [{ type: "select", name: "value", label, options: choices, selected }],
  });
  return result ? result.value : null;
}
