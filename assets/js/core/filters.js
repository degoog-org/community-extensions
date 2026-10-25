import { ITEM_KINDS, ItemKind } from "./kinds.js";
import { itemSubLabel, subtypeLabel } from "./labels.js";

export const ALL_KINDS = "all";

const SUBTYPED_KINDS = new Set([ItemKind.ENGINE, ItemKind.PLUGIN]);

export const hasSubtypes = (kind) => SUBTYPED_KINDS.has(kind);

export const matchesWords = (fields, q) => {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fields.filter(Boolean).join("\n").toLowerCase();
  return words.every((word) => haystack.includes(word));
};

const _matchesQuery = (item, q) =>
  matchesWords(
    [item.name, item.description, item.author?.name, item.repoName, itemSubLabel(item), item.path],
    q,
  );

export const inRepos = (state, item) => !state.repos.length || state.repos.includes(item.repoId);

export const passes = (state, item, withKind = true) => {
  if (!inRepos(state, item)) return false;
  if (withKind && state.kind !== ALL_KINDS && item.kind !== state.kind) return false;
  if (withKind && state.sub && !item.subtypes.includes(state.sub)) return false;
  return _matchesQuery(item, state.q);
};

export const kindSubtypes = (items, kind) => {
  if (!hasSubtypes(kind)) return [];
  const set = new Set();
  items.filter((i) => i.kind === kind).forEach((i) => i.subtypes.forEach((s) => set.add(s)));
  return [...set].sort((a, b) => subtypeLabel(kind, a).localeCompare(subtypeLabel(kind, b)));
};

export const isKind = (value) => value === ALL_KINDS || ITEM_KINDS.includes(value);

export const isFiltered = (state) => Boolean(state.q.trim() || state.sub || state.repos.length);
