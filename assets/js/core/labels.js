import { ItemKind } from "./kinds.js";

export const KIND_LABELS = Object.freeze({
  [ItemKind.ENGINE]: { one: "Engine", many: "Engines" },
  [ItemKind.PLUGIN]: { one: "Plugin", many: "Plugins" },
  [ItemKind.TRANSPORT]: { one: "Transport", many: "Transports" },
  [ItemKind.AUTOCOMPLETE]: { one: "Autocomplete", many: "Autocomplete" },
  [ItemKind.FAVICON]: { one: "Favicon", many: "Favicons" },
  [ItemKind.SHORTCUT]: { one: "Shortcut", many: "Shortcuts" },
  [ItemKind.THEME]: { one: "Theme", many: "Themes" },
});

export const KIND_ICONS = Object.freeze({
  [ItemKind.ENGINE]: "fa-bolt",
  [ItemKind.PLUGIN]: "fa-puzzle-piece",
  [ItemKind.TRANSPORT]: "fa-network-wired",
  [ItemKind.AUTOCOMPLETE]: "fa-keyboard",
  [ItemKind.FAVICON]: "fa-icons",
  [ItemKind.SHORTCUT]: "fa-arrow-down-a-z",
  [ItemKind.THEME]: "fa-palette",
});

const PLUGIN_SUBTYPES = Object.freeze({
  command: "Bang",
  slot: "Slot",
  "search-result-tab": "Search tab",
  searchBarAction: "Search bar",
});

const UPPERCASE_SUBTYPES = new Set(["it"]);

const _capitalise = (value) => value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

export const kindLabel = (kind) => KIND_LABELS[kind]?.one ?? kind;

export const kindsLabel = (kind) => KIND_LABELS[kind]?.many ?? kind;

export const subtypeLabel = (kind, sub) => {
  if (kind === ItemKind.PLUGIN && PLUGIN_SUBTYPES[sub]) return PLUGIN_SUBTYPES[sub];
  if (UPPERCASE_SUBTYPES.has(sub)) return sub.toUpperCase();
  return _capitalise(sub);
};

export const itemSubLabel = (item) =>
  item.subtypes.length ? subtypeLabel(item.kind, item.subtypes[0]) : "";

export const counted = (count, one, many) =>
  `${count.toLocaleString()} ${count === 1 ? one : many}`;

export const extensionsCount = (count) => counted(count, "extension", "extensions");

const AGO_UNITS = [
  { limit: 60, size: 1, name: "second" },
  { limit: 3600, size: 60, name: "minute" },
  { limit: 86400, size: 3600, name: "hour" },
  { limit: Infinity, size: 86400, name: "day" },
];

export const timeAgo = (iso) => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const unit = AGO_UNITS.find((u) => seconds < u.limit);
  const value = Math.floor(seconds / unit.size);
  if (unit.size === 1) return "just now";
  return `${counted(value, unit.name, `${unit.name}s`)} ago`;
};
