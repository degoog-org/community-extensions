import { CATALOG_URL } from "./config.js";
import { CATALOG_VERSION } from "./kinds.js";
import { logger } from "./logger.js";

const _byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const _byRepo = (a, b) => Number(b.official) - Number(a.official) || _byName(a, b);

const _index = (data) => {
  const repos = [...data.repos].sort(_byRepo);
  const repoMap = new Map(repos.map((r) => [r.id, r]));
  const items = data.items
    .filter((i) => repoMap.has(i.repoId))
    .map((i) => ({ ...i, repoName: repoMap.get(i.repoId).name }))
    .sort(_byName);
  return {
    generatedAt: data.generatedAt,
    repos,
    items,
    repo: (id) => repoMap.get(id) ?? null,
    item: (id) => items.find((i) => i.id === id) ?? null,
    repoItems: (id) => items.filter((i) => i.repoId === id),
    byInput: (input) => repos.find((r) => r.input === input) ?? null,
  };
};

let pending = null;

export const loadCatalog = () => {
  pending ??= fetch(CATALOG_URL, { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(`catalog request failed with ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (data?.version !== CATALOG_VERSION) throw new Error("unsupported catalog version");
      return _index(data);
    })
    .catch((err) => {
      logger.error("catalog", "could not load the extension catalog", err);
      pending = null;
      throw err;
    });
  return pending;
};

export const fillPath = (pattern, path) =>
  pattern.replace("{epath}", encodeURIComponent(path)).replace("{path}", path);
