export const ItemKind = Object.freeze({
  ENGINE: "engine",
  PLUGIN: "plugin",
  TRANSPORT: "transport",
  AUTOCOMPLETE: "autocomplete",
  FAVICON: "favicon",
  SHORTCUT: "shortcut",
  THEME: "theme",
});

export const ITEM_KINDS = Object.freeze([
  ItemKind.ENGINE,
  ItemKind.PLUGIN,
  ItemKind.TRANSPORT,
  ItemKind.AUTOCOMPLETE,
  ItemKind.FAVICON,
  ItemKind.SHORTCUT,
  ItemKind.THEME,
]);

export const MANIFEST_KEYS = Object.freeze({
  [ItemKind.ENGINE]: "engines",
  [ItemKind.PLUGIN]: "plugins",
  [ItemKind.TRANSPORT]: "transports",
  [ItemKind.AUTOCOMPLETE]: "autocomplete",
  [ItemKind.FAVICON]: "favicon",
  [ItemKind.SHORTCUT]: "shortcuts",
  [ItemKind.THEME]: "themes",
});

export const ShortcutKind = Object.freeze({
  SINGLE: "single",
  NUMERIC: "numeric",
});

export const DEFAULT_ENGINE_TYPE = "web";

export const OFFICIAL_REPO_ID = "github.com/degoog-org/official-extensions";

export const CATALOG_VERSION = 1;
