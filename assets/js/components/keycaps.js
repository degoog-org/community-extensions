import { h } from "../core/dom.js";
import { ShortcutKind } from "../core/kinds.js";

const KEY_LABELS = Object.freeze({
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  " ": "Space",
  Escape: "Esc",
  Enter: "Enter",
});

const MAC_MODIFIERS = { ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" };
const WIN_MODIFIERS = { ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "Win" };
const LINUX_MODIFIERS = { ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "Super" };
const MODIFIER_ORDER = ["ctrl", "alt", "shift", "meta"];

const _platform = () => navigator.platform || navigator.userAgent || "";

const _modifiers = () => {
  if (/mac|iphone|ipad|ipod/i.test(_platform())) return MAC_MODIFIERS;
  if (/win/i.test(_platform())) return WIN_MODIFIERS;
  return LINUX_MODIFIERS;
};

const _keyLabel = (key) => KEY_LABELS[key] ?? (key.length === 1 ? key.toUpperCase() : key);

export const bindingParts = ({ binding, kind }) => {
  const mods = _modifiers();
  const parts = MODIFIER_ORDER.filter((mod) => binding[mod]).map((mod) => mods[mod]);
  if (kind === ShortcutKind.NUMERIC) parts.push("1-9");
  else if (binding.key) parts.push(_keyLabel(binding.key));
  return parts;
};

export const keycaps = (shortcut, extra = "") => {
  const caps = shortcut ? bindingParts(shortcut) : [];
  if (!caps.length) return null;
  return h(
    "span",
    { class: `store-keys ${extra}`.trim() },
    caps.map((cap, index) => [
      index > 0 ? h("span", { class: "store-keycap-plus" }, "+") : null,
      h("kbd", { class: "store-keycap" }, cap),
    ]),
  );
};
