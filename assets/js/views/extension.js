import { extHero } from "../components/ext-hero.js";
import { factsPanel, installPanel } from "../components/ext-facts.js";
import { openShots } from "../components/lightbox.js";
import { repoBrowseHref } from "../components/repo-tile.js";
import { storeGrid } from "../components/results.js";
import { RELATED_COUNT, SITE_NAME } from "../core/config.js";
import { h, icon, mount } from "../core/dom.js";
import { storeHref } from "../core/router.js";
import { fetchReadme, renderReadme, scrollToAnchor } from "../core/markdown.js";
import { renderMissing } from "./missing.js";

const _back = () =>
  h("a", { class: "settings-page-back", href: storeHref() }, icon("fa-arrow-left"), "Back to store");

const _shots = (item) => {
  if (!item.screenshots.length) return null;
  return h(
    "section",
    { class: "ext-section", "aria-label": "Screenshots" },
    h(
      "div",
      { class: "store-group-head" },
      h("h2", { class: "store-group-title" }, "Screenshots"),
      h("span", { class: "store-group-count" }, String(item.screenshots.length)),
    ),
    h(
      "div",
      { class: "ext-shots" },
      item.screenshots.map((url, index) =>
        h(
          "button",
          {
            type: "button",
            class: "store-thumb ext-shot",
            "aria-label": `View screenshot ${index + 1} of ${item.name}`,
            onClick: () => openShots(item.screenshots, item.name, index),
          },
          h("img", { src: url, alt: "", loading: "lazy", decoding: "async" }),
        ),
      ),
    ),
  );
};

const _readmeEmpty = (text) => h("p", { class: "ext-readme-empty" }, text);

const _readme = (item, repo) => {
  const body = h("div", { class: "ext-readme markdown-body" });
  const panel = h(
    "section",
    { class: "ext-section", "aria-label": "README" },
    h("div", { class: "store-group-head" }, h("h2", { class: "store-group-title" }, "README")),
    h("div", { class: "degoog-panel ext-readme-panel" }, body),
  );
  if (!item.readme) {
    mount(body, _readmeEmpty("This extension has no README yet."));
    return panel;
  }
  mount(body, h("div", { class: "skeleton ext-readme-skel" }), h("div", { class: "skeleton ext-readme-skel ext-readme-skel--short" }));
  body.addEventListener("click", (event) => scrollToAnchor(body, event));
  fetchReadme(item.readme).then((md) => {
    if (!body.isConnected) return;
    mount(body, md ? renderReadme(md, repo, item.path) : _readmeEmpty("The README could not be loaded right now."));
  });
  return panel;
};

const _related = (catalog, item, repo) => {
  const others = catalog.repoItems(repo.id).filter((i) => i.id !== item.id);
  if (!others.length) return null;
  return h(
    "section",
    { class: "ext-section ext-related", "aria-label": `More from ${repo.name}` },
    h(
      "div",
      { class: "store-group-head" },
      h("h2", { class: "store-group-title" }, `More from ${repo.name}`),
      h("span", { class: "store-group-count" }, others.length.toLocaleString()),
      others.length > RELATED_COUNT
        ? h("a", { class: "store-show-all store-group-more", href: repoBrowseHref(repo) }, `Show all ${others.length + 1}`)
        : null,
    ),
    storeGrid("", others.slice(0, RELATED_COUNT)),
  );
};

export const renderExtension = (root, catalog, route) => {
  const item = catalog.item(route.id);
  if (!item) return renderMissing(root, "That extension isn't in the catalog. It may have been renamed or removed from its store.");
  const repo = catalog.repo(item.repoId);
  document.title = `${item.name} · ${SITE_NAME}`;
  mount(
    root,
    h(
      "div",
      { class: "store ext-page" },
      _back(),
      extHero(item, repo),
      h(
        "div",
        { class: "ext-layout" },
        h("div", { class: "ext-main" }, _shots(item), _readme(item, repo)),
        h("aside", { class: "ext-aside" }, installPanel(item, repo), factsPanel(item, repo)),
      ),
      _related(catalog, item, repo),
    ),
  );
  return { keepTitle: true };
};
