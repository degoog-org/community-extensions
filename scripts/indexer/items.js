import {
  DEFAULT_ENGINE_TYPE,
  ITEM_KINDS,
  ItemKind,
  MANIFEST_KEYS,
} from "../../assets/js/core/kinds.js";
import { IMAGE_EXT, README_NAMES, SOURCE_ENTRIES } from "./config.js";
import { getJson, getText } from "./http.js";
import { engineTypes, shortcutMeta, splitTypes } from "./source-meta.js";

const NEEDS_SOURCE = new Set([ItemKind.ENGINE, ItemKind.SHORTCUT]);

const _clean = (path) => String(path || "").replace(/^\.?\/+|\/+$/g, "");

const _str = (value) => (typeof value === "string" ? value.trim() : "");

export const manifestEntries = (pkg) =>
  ITEM_KINDS.flatMap((kind) => {
    const list = pkg[MANIFEST_KEYS[kind]];
    if (!Array.isArray(list)) return [];
    return list
      .filter((entry) => entry && typeof entry.path === "string")
      .map((entry) => ({ kind, entry, path: _clean(entry.path) }));
  });

const _inDir = (paths, dir) => {
  const prefix = `${dir}/`;
  return paths.filter((p) => p.startsWith(prefix));
};

const _screens = (files, dir) =>
  files.filter((p) => p.startsWith(`${dir}/screenshots/`) && IMAGE_EXT.test(p)).sort();

const _readme = (files, dir) =>
  README_NAMES.map((name) => `${dir}/${name}`).find((p) => files.includes(p)) || null;

const _sourceFile = (files, dir) =>
  SOURCE_ENTRIES.map((name) => `${dir}/${name}`).find((p) => files.includes(p)) || null;

const _author = async (ctx, files, dir) => {
  const file = `${dir}/author.json`;
  if (!files.includes(file)) return ctx.author;
  const data = await getJson(ctx.raw(file));
  const name = _str(data?.name);
  if (!name) return ctx.author;
  return { name, url: _str(data.url) || null };
};

const _sourceMeta = async (ctx, kind, files, dir, entry) => {
  const manifestTypes = kind === ItemKind.ENGINE ? splitTypes(entry.type) : [];
  if (!NEEDS_SOURCE.has(kind) || manifestTypes.length) return { types: manifestTypes };
  const file = _sourceFile(files, dir);
  const src = file ? await getText(ctx.raw(file)) : null;
  if (!src) return { types: [] };
  if (kind === ItemKind.ENGINE) return { types: engineTypes(src) };
  return { types: [], shortcut: shortcutMeta(src) };
};

const _subtypes = (kind, entry, types) => {
  if (kind === ItemKind.PLUGIN) return _str(entry.type) ? [_str(entry.type)] : [];
  if (kind === ItemKind.ENGINE) return types.length ? types : [DEFAULT_ENGINE_TYPE];
  return [];
};

const _deps = (entry) =>
  Array.isArray(entry.dependencies) ? entry.dependencies.filter((d) => typeof d === "string") : [];

export const buildItem = async (ctx, { kind, entry, path }) => {
  const files = _inDir(ctx.paths, path);
  if (!files.length) return null;
  const [author, meta] = await Promise.all([
    _author(ctx, files, path),
    _sourceMeta(ctx, kind, files, path, entry),
  ]);
  const readme = _readme(files, path);
  const item = {
    id: `${ctx.repoId}/${path}`,
    repoId: ctx.repoId,
    kind,
    path,
    name: _str(entry.name) || path.split("/").pop(),
    description: _str(entry.description),
    version: _str(entry.version) || "0.0.0",
    author,
    subtypes: _subtypes(kind, entry, meta.types),
    screenshots: _screens(files, path).map((p) => ctx.raw(p)),
    readme: readme ? ctx.raw(readme) : null,
    source: ctx.source(path),
  };
  if (meta.shortcut) item.shortcut = meta.shortcut;
  if (_str(entry.minDegoogVersion)) item.minDegoogVersion = _str(entry.minDegoogVersion);
  if (_deps(entry).length) item.dependencies = _deps(entry);
  return item;
};
