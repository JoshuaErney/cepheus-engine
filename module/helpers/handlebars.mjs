export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("cepheusSign", value => (value >= 0 ? `+${value}` : `${value}`));

  Handlebars.registerHelper("cepheusHex", value =>
    Math.clamp(value ?? 0, 0, 15).toString(16).toUpperCase()
  );

  Handlebars.registerHelper("includes", (arr, val) => Array.isArray(arr) && arr.includes(val));

  // Build an inline array from template args — e.g. {{#if (includes (array "a" "b") val)}}.
  // The trailing arg is Handlebars' own options object, not a real parameter.
  Handlebars.registerHelper("array", (...args) => args.slice(0, -1));

  // Return array of an object's keys — used in chargen skill tables.
  Handlebars.registerHelper("keys", obj => (obj ? Object.keys(obj) : []));

  // 1-based @index for display (e.g. muster-out table rows).
  Handlebars.registerHelper("inc", n => n + 1);
}
