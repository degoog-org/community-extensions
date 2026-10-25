import { browseToParams, emptyBrowse } from "../core/browse-state.js";
import { externalLink, h, icon } from "../core/dom.js";
import { extensionsCount } from "../core/labels.js";
import { Route, hrefFor } from "../core/router.js";
import { repoAvatar } from "./avatar.js";
import { copyText } from "./flash.js";

export const REPO_DETAIL_ID = "store-repo-detail";

export const repoBrowseHref = (repo) => hrefFor(Route.BROWSE, browseToParams({ ...emptyBrowse(), repos: [repo.id] }));

const _byline = (repo) =>
  [extensionsCount(repo.itemCount), repo.author?.name ? `by ${repo.author.name}` : "", repo.hostLabel]
    .filter(Boolean)
    .join(" · ");

export const repoTile = (repo, open, onToggle) =>
  h(
    "div",
    { class: open ? "store-repo store-repo--open" : "store-repo", "data-repo": repo.id },
    h(
      "button",
      {
        type: "button",
        class: "store-repo-main",
        "aria-expanded": String(open),
        "aria-controls": REPO_DETAIL_ID,
        onClick: () => onToggle(repo.id),
      },
      repoAvatar(repo),
      h(
        "span",
        { class: "store-repo-text" },
        h(
          "span",
          { class: "store-repo-name" },
          h("span", { class: "store-repo-name-text" }, repo.name),
          repo.official ? h("span", { class: "store-quiet" }, "Official") : null,
        ),
        h("span", { class: "store-repo-sub" }, extensionsCount(repo.itemCount)),
      ),
      icon("fa-chevron-down", "store-repo-chevron"),
    ),
  );

export const repoDetail = (repo) =>
  h(
    "div",
    { class: "store-repo-detail", id: REPO_DETAIL_ID, role: "region", "aria-label": `${repo.name} details` },
    h(
      "div",
      { class: "store-repo-detail-text" },
      h(
        "span",
        { class: "store-repo-detail-name" },
        repo.name,
        repo.official ? h("span", { class: "store-quiet" }, "Official") : null,
      ),
      externalLink(repo.webUrl, { class: "store-repo-url" }, repo.displayUrl),
      repo.description ? h("p", { class: "store-repo-line store-repo-desc" }, repo.description) : null,
      h("p", { class: "store-repo-line" }, _byline(repo)),
    ),
    h(
      "div",
      { class: "store-repo-detail-actions" },
      h(
        "a",
        { class: "degoog-btn degoog-btn--secondary degoog-btn--sm", href: repoBrowseHref(repo) },
        `Browse ${extensionsCount(repo.itemCount)}`,
      ),
      h(
        "button",
        {
          type: "button",
          class: "store-icon-btn",
          "data-tooltip": "Copy git URL",
          "aria-label": `Copy git URL of ${repo.name}`,
          onClick: () => copyText(repo.gitUrl, "Git URL copied"),
        },
        icon("fa-copy"),
      ),
      externalLink(
        repo.webUrl,
        { class: "store-icon-btn", "data-tooltip": `Open on ${repo.hostLabel}`, "aria-label": `Open ${repo.name} on ${repo.hostLabel}` },
        icon("fa-arrow-up-right-from-square"),
      ),
    ),
  );
