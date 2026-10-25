import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { CATALOG_VERSION } from "../../assets/js/core/kinds.js";
import {
  GITHUB_OUTPUT,
  OUTPUT_FILE,
  PREVIOUS_CATALOG_URL,
  STORE_CONCURRENCY,
  STORES_FILE,
} from "./config.js";
import { getJson, pool } from "./http.js";
import { logger } from "./logger.js";
import { crawlRepo } from "./repo.js";

const _readStores = async () => {
  const list = JSON.parse(await readFile(STORES_FILE, "utf-8"));
  if (!Array.isArray(list)) throw new Error(`${STORES_FILE} must be an array of urls`);
  return [...new Set(list.map((s) => String(s).trim()).filter(Boolean))];
};

const _previous = async () => {
  if (!PREVIOUS_CATALOG_URL) return null;
  const data = await getJson(PREVIOUS_CATALOG_URL);
  if (data?.version !== CATALOG_VERSION) return null;
  logger.info("indexer", `loaded previous catalog from ${PREVIOUS_CATALOG_URL}`);
  return data;
};

const _fallback = (previous, input) => {
  const repo = previous?.repos?.find((r) => r.input === input);
  if (!repo) return null;
  const items = previous.items.filter((i) => i.repoId === repo.id);
  return { repo, items };
};

const _crawl = async (input, previous) => {
  try {
    const out = await crawlRepo(input);
    logger.info("indexer", `${out.repo.displayUrl}: ${out.items.length} extensions`);
    return out;
  } catch (err) {
    logger.warn("indexer", `skipping ${input}`, err);
    return _fallback(previous, input);
  }
};

const _merge = (results) => {
  const seen = new Set();
  const catalog = { repos: [], items: [] };
  results.filter(Boolean).forEach((res) => {
    if (seen.has(res.repo.id)) return;
    seen.add(res.repo.id);
    catalog.repos.push(res.repo);
    catalog.items.push(...res.items);
  });
  return catalog;
};

const _fingerprint = (catalog) => JSON.stringify({ repos: catalog.repos, items: catalog.items });

const _report = async (changed) => {
  if (!GITHUB_OUTPUT) return;
  await appendFile(GITHUB_OUTPUT, `changed=${changed}\n`);
};

const hogwarts = async () => {
  const stores = await _readStores();
  const previous = await _previous();
  logger.info("indexer", `indexing ${stores.length} stores`);
  const results = await pool(stores, STORE_CONCURRENCY, (input) => _crawl(input, previous));
  const merged = _merge(results);
  const changed = !previous || _fingerprint(previous) !== _fingerprint(merged);
  const catalog = {
    version: CATALOG_VERSION,
    generatedAt: changed ? new Date().toISOString() : previous.generatedAt,
    ...merged,
  };
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(catalog));
  logger.info(
    "indexer",
    `wrote ${catalog.repos.length} repos, ${catalog.items.length} extensions to ${OUTPUT_FILE}`,
  );
  logger.info("indexer", changed ? "catalog changed" : "catalog unchanged since the last deploy");
  await _report(changed);
};

hogwarts().catch((err) => {
  logger.error("indexer", "indexing aborted", err);
  process.exit(1);
});
