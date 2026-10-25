export const STORES_FILE = "stores.json";
export const OUTPUT_FILE = "data/catalog.json";

export const REQUEST_TIMEOUT_MS = 20_000;
export const REQUEST_RETRIES = 2;
export const RETRY_DELAY_MS = 1_500;
export const STORE_CONCURRENCY = 6;
export const FILE_CONCURRENCY = 8;

export const GITLAB_PAGE_SIZE = 100;
export const GITLAB_MAX_PAGES = 20;
export const GITEA_FALLBACK_REFS = ["main", "master"];

export const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
export const README_NAMES = ["README.md", "readme.md", "Readme.md", "README.MD"];
export const SOURCE_ENTRIES = ["index.js", "index.ts", "index.mjs", "index.cjs"];

export const PATH_TOKEN = "{path}";
export const ENCODED_PATH_TOKEN = "{epath}";

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
export const PREVIOUS_CATALOG_URL = process.env.PREVIOUS_CATALOG_URL || "";
export const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT || "";
