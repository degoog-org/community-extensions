export const SITE_NAME = "degoog community extensions";
export const CATALOG_URL = "data/catalog.json";

export const THEME_KEY = "dce:theme";
export const PREVIEW_COUNT = 6;
export const RELATED_COUNT = 4;
export const FLASH_MS = 2200;
export const SEARCH_DEBOUNCE_MS = 120;

export const SITE_REPO_URL = "https://github.com/degoog-org/community-extensions";
export const SUBMIT_URL = `${SITE_REPO_URL}/edit/main/stores.json`;
export const DEGOOG_URL = "https://github.com/fccview/degoog";
export const DOCS_URL = "https://degoog-org.github.io/docs/";
export const STORE_DOCS_URL = "https://degoog-org.github.io/docs/store.html";

export const Theme = Object.freeze({
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
});

export const THEME_ORDER = Object.freeze([Theme.SYSTEM, Theme.LIGHT, Theme.DARK]);

export const THEME_ICONS = Object.freeze({
  [Theme.SYSTEM]: "fa-circle-half-stroke",
  [Theme.LIGHT]: "fa-sun",
  [Theme.DARK]: "fa-moon",
});

export const THEME_LABELS = Object.freeze({
  [Theme.SYSTEM]: "System theme",
  [Theme.LIGHT]: "Light theme",
  [Theme.DARK]: "Dark theme",
});
