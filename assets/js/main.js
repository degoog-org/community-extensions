import { sidebar } from "./components/sidebar.js";
import { closeShot } from "./components/lightbox.js";
import { loadCatalog } from "./core/catalog.js";
import { SITE_NAME } from "./core/config.js";
import { h, mount } from "./core/dom.js";
import { logger } from "./core/logger.js";
import { Route, extensionHref, hrefFor, parseRoute, rememberStore, replaceQuery } from "./core/router.js";
import { lumos } from "./core/theme.js";
import { renderBrowse } from "./views/browse.js";
import { renderExtension } from "./views/extension.js";
import { renderBroken, renderMissing } from "./views/missing.js";
import { renderRepos } from "./views/repos.js";
import { renderSubmit } from "./views/submit.js";

const VIEWS = Object.freeze({
  [Route.BROWSE]: renderBrowse,
  [Route.REPOS]: renderRepos,
  [Route.EXTENSION]: renderExtension,
  [Route.SUBMIT]: renderSubmit,
});

const FOCUS_SEARCH_KEY = "/";

const main = document.getElementById("main");
const nav = sidebar();
let current = null;

const _skeleton = () =>
  h(
    "div",
    { class: "store", "aria-busy": "true" },
    h("div", { class: "skeleton store-skel-nav" }),
    h("div", { class: "skeleton store-skel-bar" }),
    h("div", { class: "store-grid" }, Array.from({ length: 6 }, () => h("div", { class: "skeleton store-skel-card" }))),
  );

const _legacyHref = (route, catalog) => {
  const repo = catalog.byInput(route.params.get("repo") || "");
  if (!repo) return hrefFor(Route.BROWSE);
  const ext = (route.params.get("ext") || "").replace(/^\/+|\/+$/g, "");
  return ext ? extensionHref(`${repo.id}/${ext}`) : hrefFor(Route.BROWSE, { repos: repo.id });
};

const accio = async () => {
  const route = parseRoute();
  nav.setActive(route.name);
  if (route.name !== Route.SUBMIT && !current) mount(main, _skeleton());
  try {
    const catalog = route.name === Route.SUBMIT ? null : await loadCatalog();
    if (route.name === Route.LEGACY) {
      replaceQuery(_legacyHref(route, catalog));
      return accio();
    }
    current?.dispose?.();
    const view = VIEWS[route.name] ?? renderMissing;
    current = view(main, catalog, route) ?? {};
    if (!current.keepTitle) document.title = SITE_NAME;
  } catch (err) {
    logger.error("router", `could not render ${location.hash || "#/"}`, err);
    current = null;
    renderBroken(main, accio);
  }
};

const _onKey = (event) => {
  if (event.key !== FOCUS_SEARCH_KEY || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest("input, textarea, select, [contenteditable]")) return;
  if (!current?.focusSearch) return;
  event.preventDefault();
  current.focusSearch();
};

lumos([...document.querySelectorAll("[data-theme-toggle]")]);
document.addEventListener("keydown", _onKey);
window.addEventListener("hashchange", (event) => {
  rememberStore(event.oldURL);
  closeShot();
  accio().then(() => window.scrollTo({ top: 0 }));
});
accio();
