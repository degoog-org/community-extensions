import { PREVIEW_COUNT } from "../core/config.js";
import { h } from "../core/dom.js";
import { ALL_KINDS } from "../core/filters.js";
import { ITEM_KINDS, ItemKind } from "../core/kinds.js";
import { kindsLabel } from "../core/labels.js";
import { SortKey, isDateSort, sortItems, sortLabel } from "../core/sort.js";
import { itemCard } from "./card.js";

export const storeGrid = (kind, items, sort) =>
  h(
    "div",
    { class: kind === ItemKind.THEME ? "store-grid store-grid--theme" : "store-grid" },
    items.map((item) => itemCard(item, sort)),
  );

const _more = (label, onClick) =>
  h("button", { type: "button", class: "store-show-all store-group-more", onClick }, label);

const _section = (title, count, more, grid) =>
  h(
    "section",
    { class: "store-group", "aria-label": title },
    h(
      "div",
      { class: "store-group-head" },
      h("h3", { class: "store-group-title" }, title),
      count === null ? null : h("span", { class: "store-group-count" }, count.toLocaleString()),
      more,
    ),
    grid,
  );

const _group = (kind, items, preview, onShowAll) => {
  const shown = preview ? items.slice(0, PREVIEW_COUNT) : items;
  return _section(
    kindsLabel(kind),
    items.length,
    items.length > shown.length ? _more(`Show all ${items.length.toLocaleString()}`, () => onShowAll(kind)) : null,
    storeGrid(kind, shown),
  );
};

const _recent = (list, onSort) =>
  _section(
    sortLabel(SortKey.ADDED),
    null,
    _more("Show more", () => onSort(SortKey.ADDED)),
    storeGrid("", sortItems(list, SortKey.ADDED).slice(0, PREVIEW_COUNT), SortKey.ADDED),
  );

const _sorted = (list, kind, sort) =>
  _section(sortLabel(sort), list.length, null, storeGrid(kind === ALL_KINDS ? "" : kind, list, sort));

const _grouped = (list, preview, recent, onShowAll, onSort) => [
  recent ? _recent(list, onSort) : null,
  ITEM_KINDS.map((kind) => {
    const items = list.filter((item) => item.kind === kind);
    return items.length ? _group(kind, items, preview, onShowAll) : null;
  }),
];

const _empty = (q, filtered, onClear) =>
  h(
    "div",
    { class: "store-empty" },
    h("p", {}, q ? `No extensions match "${q}".` : "No extensions match these filters."),
    filtered ? h("button", { type: "button", class: "degoog-btn degoog-btn--secondary degoog-btn--sm", onClick: onClear }, "Clear filters") : null,
  );

export const results = ({ list, q, kind, sort, preview, recent, filtered, onShowAll, onSort, onClear }) => {
  if (!list.length) return h("div", { class: "store-results" }, _empty(q.trim(), filtered, onClear));
  return h(
    "div",
    { class: "store-results" },
    isDateSort(sort) ? _sorted(list, kind, sort) : _grouped(list, preview, recent, onShowAll, onSort),
  );
};
