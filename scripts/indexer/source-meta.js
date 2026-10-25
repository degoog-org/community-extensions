import { ShortcutKind } from "../../assets/js/core/kinds.js";

const ENGINE_TYPE_STRING = /export\s+const\s+type\s*=\s*["']([^"']+)["']/;
const ENGINE_TYPE_ARRAY = /export\s+const\s+type\s*=\s*\[([^\]]+)\]/;
const SHORTCUT_KIND = /\bkind\s*:\s*["'](single|numeric)["']/;
const SHORTCUT_BINDING = /defaultBinding\s*:\s*\{([^}]*)\}/;
const SHORTCUT_KEY = /["']?\bkey\b["']?\s*:\s*["']([^"']+)["']/;
const MODIFIERS = ["ctrl", "meta", "alt", "shift"];

export const splitTypes = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

export const engineTypes = (src) => {
  const single = ENGINE_TYPE_STRING.exec(src);
  if (single) return [single[1].trim()];
  const list = ENGINE_TYPE_ARRAY.exec(src);
  if (!list) return [];
  return splitTypes(list[1]);
};

const _hasModifier = (binding) => MODIFIERS.some((mod) => binding[mod]);

export const shortcutMeta = (src) => {
  const block = SHORTCUT_BINDING.exec(src)?.[1];
  if (!block) return null;
  const binding = {};
  const key = SHORTCUT_KEY.exec(block)?.[1];
  if (key) binding.key = key;
  MODIFIERS.forEach((mod) => {
    if (new RegExp(`["']?\\b${mod}\\b["']?\\s*:\\s*true`).test(block)) binding[mod] = true;
  });
  const kind =
    SHORTCUT_KIND.exec(src)?.[1] === ShortcutKind.NUMERIC
      ? ShortcutKind.NUMERIC
      : ShortcutKind.SINGLE;
  if (kind === ShortcutKind.SINGLE && !binding.key) return null;
  if (kind === ShortcutKind.NUMERIC && !_hasModifier(binding)) return null;
  return { binding, kind };
};
