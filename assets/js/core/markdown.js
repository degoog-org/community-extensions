import { fillPath } from "./catalog.js";
import { logger } from "./logger.js";

const ABSOLUTE = /^([a-z][a-z0-9+.-]*:|\/\/)/i;
const HEADINGS = "h1, h2, h3, h4, h5, h6";

const readmeCache = new Map();

const _normalize = (base, href) => {
  const [path] = href.split(/[?#]/);
  const start = path.startsWith("/") ? [] : base.split("/").filter(Boolean);
  const parts = path.split("/").reduce((acc, part) => {
    if (part === "..") acc.pop();
    else if (part && part !== ".") acc.push(part);
    return acc;
  }, start);
  return parts.join("/");
};

const _slug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");

const _rewriteMedia = (root, repo, base) => {
  root.querySelectorAll("img[src], video[src], source[src]").forEach((el) => {
    const src = el.getAttribute("src");
    if (!ABSOLUTE.test(src)) el.setAttribute("src", fillPath(repo.links.raw, _normalize(base, src)));
    el.setAttribute("loading", "lazy");
  });
};

const _rewriteLinks = (root, repo, base) => {
  root.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href.startsWith("#")) return a.setAttribute("data-anchor", href.slice(1));
    if (!ABSOLUTE.test(href)) a.setAttribute("href", fillPath(repo.links.blob, _normalize(base, href)));
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
};

const _anchorHeadings = (root) => {
  root.querySelectorAll(HEADINGS).forEach((heading) => {
    if (!heading.id) heading.id = `readme-${_slug(heading.textContent || "")}`;
  });
};

export const renderReadme = (md, repo, base) => {
  const html = window.marked.parse(md, { gfm: true, breaks: false });
  const clean = window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  const template = document.createElement("template");
  template.innerHTML = clean;
  _rewriteMedia(template.content, repo, base);
  _rewriteLinks(template.content, repo, base);
  _anchorHeadings(template.content);
  return template.content;
};

export const scrollToAnchor = (root, event) => {
  const link = event.target.closest("a[data-anchor]");
  if (!link) return;
  event.preventDefault();
  const id = link.getAttribute("data-anchor");
  const target = root.querySelector(`#${CSS.escape(id)}, #readme-${CSS.escape(id)}`);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const fetchReadme = (url) => {
  if (!readmeCache.has(url)) {
    const request = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`readme request failed with ${res.status}`);
        return res.text();
      })
      .catch((err) => {
        logger.warn("readme", `could not load ${url}`, err);
        readmeCache.delete(url);
        return null;
      });
    readmeCache.set(url, request);
  }
  return readmeCache.get(url);
};
