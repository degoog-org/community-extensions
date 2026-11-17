import { fullDate, timeAgo } from "./labels.js";

export const SortKey = Object.freeze({
  NAME: "name",
  ADDED: "added",
  UPDATED: "updated",
});

const SORTS = Object.freeze({
  [SortKey.NAME]: { label: "Name", field: null, verb: "" },
  [SortKey.ADDED]: { label: "Recently added", field: "addedAt", verb: "Added" },
  [SortKey.UPDATED]: { label: "Recently updated", field: "updatedAt", verb: "Updated" },
});

export const SORT_KEYS = Object.freeze(Object.keys(SORTS));

export const isSort = (value) => SORT_KEYS.includes(value);

export const isDateSort = (sort) => Boolean(SORTS[sort]?.field);

export const sortLabel = (sort) => SORTS[sort]?.label ?? sort;

export const sortItems = (list, sort) => {
  const field = SORTS[sort]?.field;
  if (!field) return list;
  return [...list].sort((a, b) => (b[field] ?? "").localeCompare(a[field] ?? ""));
};

export const itemStamp = (item, sort) => {
  const { field, verb } = SORTS[sort] ?? {};
  const at = field ? item[field] : null;
  if (!at) return null;
  return { text: `${verb} ${timeAgo(at)}`, title: fullDate(at), at };
};
