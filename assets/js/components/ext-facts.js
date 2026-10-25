import { externalLink, h, icon } from "../core/dom.js";
import { kindLabel, subtypeLabel } from "../core/labels.js";
import { copyText } from "./flash.js";
import { keycaps } from "./keycaps.js";

const _row = (label, ...value) =>
  h("div", { class: "ext-fact" }, h("dt", { class: "ext-fact-label" }, label), h("dd", { class: "ext-fact-value" }, ...value));

const _code = (text) => h("code", { class: "store-code" }, text);

const _panel = (title, iconName, ...body) =>
  h(
    "section",
    { class: "degoog-panel ext-side-panel" },
    h("div", { class: "ext-side-head" }, h("h2", { class: "ext-side-title" }, title), icon(iconName, "ext-side-icon")),
    ...body,
  );

export const step = (n, ...content) =>
  h("li", { class: "ext-step" }, h("span", { class: "ext-step-n" }, String(n)), h("span", { class: "ext-step-text" }, ...content));

const _gitRow = (repo) =>
  h(
    "div",
    { class: "ext-git" },
    h("code", { class: "store-code ext-git-url" }, repo.gitUrl),
    h(
      "button",
      {
        type: "button",
        class: "store-icon-btn",
        "data-tooltip": "Copy",
        "aria-label": "Copy git URL",
        onClick: () => copyText(repo.gitUrl, "Git URL copied"),
      },
      icon("fa-copy"),
    ),
  );

export const installPanel = (item, repo) =>
  _panel(
    "Install",
    "fa-download",
    repo.official
      ? h(
          "p",
          { class: "ext-side-desc" },
          "This comes from the official repo, every degoog instance already has it. Open ",
          h("b", {}, "Settings > Store"),
          ", find ",
          h("b", {}, item.name),
          " and hit Install.",
        )
      : h(
          "ol",
          { class: "ext-steps" },
          step(1, "In degoog, open ", h("b", {}, "Settings > Store > Repositories"), "."),
          step(2, "Add this repository:", _gitRow(repo)),
          step(3, "Go to ", h("b", {}, "Browse"), ", find ", h("b", {}, item.name), " and hit Install."),
        ),
  );

const _types = (item) =>
  item.subtypes.length ? _row(item.subtypes.length > 1 ? "Types" : "Type", item.subtypes.map((s) => subtypeLabel(item.kind, s)).join(", ")) : null;

export const factsPanel = (item, repo) =>
  _panel(
    "Details",
    "fa-circle-info",
    h(
      "dl",
      { class: "ext-facts" },
      _row("Version", `v${item.version}`),
      _row("Kind", kindLabel(item.kind)),
      _types(item),
      item.shortcut ? _row("Binding", keycaps(item.shortcut, "ext-fact-keys")) : null,
      item.minDegoogVersion ? _row("Needs degoog", `${item.minDegoogVersion} or newer`) : null,
      item.dependencies?.length ? _row("Dependencies", item.dependencies.map((d, i) => [i ? ", " : "", _code(d)])) : null,
      _row("Repository", externalLink(repo.webUrl, {}, repo.displayUrl)),
      _row("Path", _code(item.path)),
    ),
  );
