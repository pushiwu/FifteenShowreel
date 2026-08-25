function legacyCopy(text) {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(textarea);
  return copied;
}

export async function copyText(text, options = {}) {
  const clipboard = options.clipboard ?? globalThis.navigator?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Continue to the legacy path when permissions or browser support fail.
    }
  }

  const fallback = options.legacyCopy ?? legacyCopy;
  return Boolean(fallback(text));
}
