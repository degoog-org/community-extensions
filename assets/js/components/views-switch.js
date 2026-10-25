import { h } from "../core/dom.js";
import { Route, hrefFor } from "../core/router.js";

const _label = (route) =>
  route === Route.REPOS
    ? [h("span", { class: "store-view-full" }, "Repositories"), h("span", { class: "store-view-short" }, "Repos")]
    : "Browse";

export const viewsSwitch = (catalog, active) =>
  h(
    "div",
    { class: "store-nav" },
    h(
      "div",
      { class: "store-views", role: "tablist", "aria-label": "Store views" },
      [
        { route: Route.BROWSE, count: catalog.items.length },
        { route: Route.REPOS, count: catalog.repos.length },
      ].map(({ route, count }) =>
        h(
          "a",
          {
            href: hrefFor(route),
            role: "tab",
            class: route === active ? "store-view-btn active" : "store-view-btn",
            "aria-selected": String(route === active),
          },
          h("span", { class: "store-view-label" }, _label(route)),
          h("span", { class: "store-view-count" }, count.toLocaleString()),
        ),
      ),
    ),
  );
