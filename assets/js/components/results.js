import { PREVIEW_COUNT } from "../core/config.js";
import { h } from "../core/dom.js";
import { ITEM_KINDS, ItemKind } from "../core/kinds.js";
import { kindsLabel } from "../core/labels.js";
import { itemCard } from "./card.js";

export const storeGrid = (kind, items) =>
  h("div", { class: kind === ItemKind.THEME ? "store-grid store-grid--theme" : "store-grid" }, items.map(itemCard));

const _group = (kind, items, preview, onShowAll) => {
  const shown = preview ? items.slice(0, PREVIEW_COUNT) : items;
  const label = kindsLabel(kind);
  return h(
    "section",
    { class: "store-group", "aria-label": label },
    h(
      "div",
      { class: "store-group-head" },
      h("h3", { class: "store-group-title" }, label),
      h("span", { class: "store-group-count" }, items.length.toLocaleString()),
      items.length > shown.length
        ? h(
            "button",
            { type: "button", class: "store-show-all store-group-more", onClick: () => onShowAll(kind) },
            `Show all ${items.length.toLocaleString()}`,
          )
        : null,
    ),
    storeGrid(kind, shown),
  );
};

const _empty = (q, filtered, onClear) =>
  h(
    "div",
    { class: "store-empty" },
    h("p", {}, q ? `No extensions match "${q}".` : "No extensions match these filters."),
    filtered ? h("button", { type: "button", class: "degoog-btn degoog-btn--secondary degoog-btn--sm", onClick: onClear }, "Clear filters") : null,
  );

export const results = ({ list, q, preview, filtered, onShowAll, onClear }) =>
  h(
    "div",
    { class: "store-results" },
    list.length
      ? ITEM_KINDS.map((kind) => {
          const items = list.filter((item) => item.kind === kind);
          return items.length ? _group(kind, items, preview, onShowAll) : null;
        })
      : _empty(q.trim(), filtered, onClear),
  );
