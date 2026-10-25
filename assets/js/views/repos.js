import { repoDetail, repoTile } from "../components/repo-tile.js";
import { viewsSwitch } from "../components/views-switch.js";
import { SUBMIT_URL } from "../core/config.js";
import { externalLink, h, mount } from "../core/dom.js";
import { counted, timeAgo } from "../core/labels.js";
import { Route, hrefFor, replaceQuery } from "../core/router.js";

const _columns = (grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;

const _detailAfter = (repos, openId, cols) => {
  const index = repos.findIndex((r) => r.id === openId);
  if (index < 0) return -1;
  return Math.min(repos.length - 1, (Math.floor(index / cols) + 1) * cols - 1);
};

const _head = () =>
  h(
    "div",
    { class: "store-panel-head" },
    h(
      "div",
      { class: "store-panel-title" },
      h("h2", { class: "settings-section-heading" }, "Repositories"),
      h(
        "p",
        { class: "settings-desc" },
        "Extensions come from git repos. Community repos are not reviewed, installing one runs its code on your server.",
      ),
    ),
    h("div", { class: "floating-section-icon", "aria-hidden": "true" }, h("i", { class: "fa-solid fa-code-branch" })),
  );

const _callout = () =>
  h(
    "div",
    { class: "store-callout" },
    h(
      "div",
      { class: "store-callout-text" },
      h("span", { class: "store-callout-title" }, "Got a store?"),
      h("span", { class: "store-callout-desc" }, "Open a pull request adding your repo URL to stores.json."),
    ),
    h(
      "div",
      { class: "store-callout-actions" },
      h("a", { class: "degoog-btn degoog-btn--secondary degoog-btn--sm", href: hrefFor(Route.SUBMIT) }, "How it works"),
      externalLink(SUBMIT_URL, { class: "degoog-btn degoog-btn--primary degoog-btn--sm" }, "Submit a store"),
    ),
  );

export const renderRepos = (root, catalog, route) => {
  let openId = catalog.repo(route.params.get("open")) ? route.params.get("open") : "";
  let cols = 1;
  const grid = h("div", { class: "store-repo-grid" });

  const paint = () => {
    const after = _detailAfter(catalog.repos, openId, cols);
    mount(
      grid,
      catalog.repos.map((repo, index) => [
        repoTile(repo, repo.id === openId, toggle),
        index === after ? repoDetail(catalog.repo(openId)) : null,
      ]),
    );
  };

  const toggle = (id) => {
    openId = openId === id ? "" : id;
    replaceQuery(hrefFor(Route.REPOS, { open: openId }));
    paint();
  };

  mount(
    root,
    h(
      "div",
      { class: "store" },
      viewsSwitch(catalog, Route.REPOS),
      h(
        "section",
        { class: "degoog-panel store-repos" },
        _head(),
        h(
          "div",
          { class: "store-panel-body" },
          _callout(),
          h(
            "div",
            { class: "store-repo-bar" },
            h("span", { class: "store-repo-summary" }, counted(catalog.repos.length, "repository", "repositories")),
            h("span", { class: "store-repo-summary" }, `Updated ${timeAgo(catalog.generatedAt)}`),
          ),
          grid,
        ),
      ),
    ),
  );

  cols = _columns(grid);
  paint();
  const observer = new ResizeObserver(() => {
    const next = _columns(grid);
    if (next === cols) return;
    cols = next;
    paint();
  });
  observer.observe(grid);
  return { dispose: () => observer.disconnect() };
};
