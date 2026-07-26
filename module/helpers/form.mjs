// Document sheets with `form.submitOnChange: true` wire both a "change" listener
// (which does the autosave we want) and Foundry's own native form "submit"
// listener, which the browser also fires when Enter is pressed in a single-line
// input. Both end up calling the same update-and-rerender handler for the same
// edit, and the second call's form/DOM references can go stale mid-flight from
// the first call's rerender, leaving the sheet blank until something forces a
// fresh render. Blocking just the Enter-triggered submit (not the change event)
// avoids the double-fire while keeping the autosave.
export function preventEnterSubmit(root) {
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const el = event.target;
    if (el.tagName !== "INPUT") return;
    if (["checkbox", "radio", "submit", "button"].includes(el.type)) return;
    event.preventDefault();
  });
}
