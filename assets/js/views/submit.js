import { SITE_NAME, SITE_REPO_URL, STORE_DOCS_URL, SUBMIT_URL } from "../core/config.js";
import { step } from "../components/ext-facts.js";
import { externalLink, h, icon, mount } from "../core/dom.js";

const HOSTS = ["GitHub", "Codeberg", "GitLab.com", "Self-hosted Gitea and Forgejo"];

const _section = (title, iconName, ...body) =>
  h(
    "section",
    { class: "degoog-panel submit-section" },
    h(
      "div",
      { class: "store-panel-head" },
      h("div", { class: "store-panel-title" }, h("h2", { class: "settings-section-heading" }, title)),
      h("div", { class: "floating-section-icon", "aria-hidden": "true" }, icon(iconName)),
    ),
    h("div", { class: "store-panel-body submit-body" }, ...body),
  );

const _code = (text) => h("code", { class: "store-code" }, text);

export const renderSubmit = (root) => {
  document.title = `Submit a store · ${SITE_NAME}`;
  mount(
    root,
    h(
      "div",
      { class: "submit-page" },
      h("h2", { class: "submit-title" }, "Submit a store"),
      h(
        "p",
        { class: "settings-desc" },
        "Every extension here lives in a community store repo. Get yours listed in a couple of minutes.",
      ),
      _section(
        "How to get listed",
        "fa-list-check",
        h(
          "ol",
          { class: "ext-steps" },
          step(1, "Build a store repo following the ", externalLink(STORE_DOCS_URL, {}, "store docs"), "."),
          step(2, "Open a pull request adding your repo URL, like ", _code('"https://github.com/owner/repo"'), ", to ", _code("stores.json"), "."),
          step(3, "Once it's merged, the site re-indexes and your extensions show up."),
        ),
        h(
          "p",
          { class: "settings-desc" },
          "Stores with a ",
          _code("repo-image"),
          ", screenshots and proper descriptions get approved faster.",
        ),
        h(
          "div",
          { class: "submit-actions" },
          externalLink(SUBMIT_URL, { class: "degoog-btn degoog-btn--primary" }, icon("fa-code-pull-request"), "Open a pull request"),
          externalLink(STORE_DOCS_URL, { class: "degoog-btn degoog-btn--secondary" }, icon("fa-book"), "Store docs"),
        ),
      ),
      _section(
        "Supported hosts",
        "fa-server",
        h("ul", { class: "submit-hosts" }, HOSTS.map((host) => h("li", {}, icon("fa-check", "store-ok"), host))),
        h(
          "p",
          { class: "settings-desc" },
          "Gitea and Forgejo instances are detected automatically, their API just needs to be publicly reachable. Need another host? ",
          externalLink(SITE_REPO_URL, {}, "Open a PR"),
          " adding a fetcher under ",
          _code("scripts/indexer/hosts"),
          ".",
        ),
      ),
    ),
  );
  return { keepTitle: true };
};
