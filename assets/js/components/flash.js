import { FLASH_MS } from "../core/config.js";
import { h } from "../core/dom.js";
import { logger } from "../core/logger.js";

export const FlashTone = Object.freeze({
  INFO: "",
  SUCCESS: "degoog-flash--success",
  ERROR: "degoog-flash--error",
});

let el = null;
let timer = 0;

const _el = () => {
  el ??= document.body.appendChild(h("div", { class: "degoog-flash", role: "status", "aria-live": "polite" }));
  return el;
};

export const flash = (text, tone = FlashTone.INFO) => {
  const node = _el();
  node.textContent = text;
  node.className = `degoog-flash degoog-flash--visible ${tone}`.trim();
  clearTimeout(timer);
  timer = setTimeout(() => node.classList.remove("degoog-flash--visible"), FLASH_MS);
};

const _legacyCopy = (text) => {
  const area = h("textarea", { readonly: true, style: "position:fixed;top:0;left:0;opacity:0;pointer-events:none" });
  area.value = text;
  document.body.append(area);
  area.select();
  try {
    return document.execCommand("copy");
  } finally {
    area.remove();
  }
};

const _clipboard = async (text) => {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      logger.warn("clipboard", "clipboard api refused, trying the fallback", err);
    }
  }
  return _legacyCopy(text);
};

export const copyText = async (text, label = "Copied") => {
  try {
    if (!(await _clipboard(text))) throw new Error("copy command was rejected");
    flash(label, FlashTone.SUCCESS);
  } catch (err) {
    logger.error("clipboard", "copy failed", err);
    flash("Could not copy, select it manually", FlashTone.ERROR);
  }
};
