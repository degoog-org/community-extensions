import { externalLink, h, icon } from "../core/dom.js";
import { kindLabel, itemSubLabel } from "../core/labels.js";
import { cardThumb } from "./card.js";
import { copyText } from "./flash.js";
import { repoBrowseHref } from "./repo-tile.js";

const _author = (author) => {
  if (!author?.name) return null;
  const name = author.url ? externalLink(author.url, { class: "ext-hero-author" }, author.name) : author.name;
  return ["by ", name, " · "];
};

export const extHero = (item, repo) =>
  h(
    "section",
    { class: "degoog-panel ext-hero" },
    cardThumb(item, "ext-hero-thumb"),
    h(
      "div",
      { class: "ext-hero-text" },
      h("span", { class: "ext-hero-kicker" }, [kindLabel(item.kind), itemSubLabel(item)].filter(Boolean).join(" · ")),
      h("h1", { class: "ext-hero-name" }, item.name),
      h(
        "p",
        { class: "ext-hero-meta" },
        _author(item.author),
        "from ",
        h("a", { href: repoBrowseHref(repo) }, repo.name),
        ` · v${item.version}`,
      ),
      item.description ? h("p", { class: "ext-hero-desc" }, item.description) : null,
      h(
        "div",
        { class: "ext-hero-actions" },
        h(
          "button",
          {
            type: "button",
            class: "degoog-btn degoog-btn--primary",
            onClick: () => copyText(repo.gitUrl, "Git URL copied"),
          },
          icon("fa-copy"),
          "Copy git URL",
        ),
        externalLink(item.source, { class: "degoog-btn degoog-btn--secondary" }, icon("fa-code"), "View source"),
      ),
    ),
  );
