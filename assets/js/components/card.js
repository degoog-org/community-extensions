import { h, icon } from "../core/dom.js";
import { ItemKind } from "../core/kinds.js";
import { KIND_ICONS, itemSubLabel } from "../core/labels.js";
import { extensionHref } from "../core/router.js";
import { retryOnce } from "./avatar.js";
import { keycaps } from "./keycaps.js";
import { openShots } from "./lightbox.js";

const _shotsLabel = (item) => {
  const n = item.screenshots.length;
  return n > 1 ? `View ${n} screenshots of ${item.name}` : `View screenshot of ${item.name}`;
};

export const cardThumb = (item, extra = "") => {
  const n = item.screenshots.length;
  if (n) {
    return h(
      "button",
      {
        type: "button",
        class: `store-thumb ${extra}`.trim(),
        "aria-label": _shotsLabel(item),
        onClick: () => openShots(item.screenshots, item.name),
      },
      h("img", { src: item.screenshots[0], alt: "", loading: "lazy", decoding: "async", onError: retryOnce }),
      n > 1 ? h("span", { class: "store-thumb-count" }, String(n)) : null,
    );
  }
  const keys = item.kind === ItemKind.SHORTCUT ? keycaps(item.shortcut) : null;
  return h("div", { class: `store-thumb ${extra}`.trim(), "aria-hidden": "true" }, keys ?? icon(KIND_ICONS[item.kind]));
};

const _meta = (item) => {
  const parts = [
    item.kind === ItemKind.THEME ? "" : itemSubLabel(item),
    item.author?.name ? `by ${item.author.name}` : "",
    item.repoName,
  ].filter(Boolean);
  return parts.join(" · ");
};

export const itemCard = (item) =>
  h(
    "article",
    { class: "store-card" },
    cardThumb(item),
    h(
      "div",
      { class: "store-card-text" },
      h("h4", { class: "store-card-name" }, h("a", { class: "store-card-link", href: extensionHref(item.id) }, item.name)),
      h("p", { class: "store-card-meta" }, _meta(item)),
      item.description ? h("p", { class: "store-card-desc", title: item.description }, item.description) : null,
    ),
    h(
      "div",
      { class: "store-card-foot" },
      h("span", { class: "store-state" }, `v${item.version}`),
      h(
        "span",
        { class: "store-actions" },
        h("span", { class: "store-card-more", "aria-hidden": "true" }, "Details", icon("fa-arrow-right")),
      ),
    ),
  );
