import { h, icon } from "../core/dom.js";

const RETRY_DELAY_MS = 1500;

const _initial = (label) => Array.from(label.replace(/[^\p{L}\p{N}]/gu, ""))[0]?.toUpperCase() ?? "";

const _hue = (label) => {
  let hash = 0;
  for (const ch of label) hash = (hash * 31 + ch.codePointAt(0)) % 360;
  return hash;
};

export const retryOnce = (event) => {
  const img = event.currentTarget;
  if (img.dataset.retried) return;
  img.dataset.retried = "true";
  setTimeout(() => {
    img.src = img.src;
  }, RETRY_DELAY_MS);
};

const _hideBroken = (event) => {
  event.currentTarget.hidden = true;
  retryOnce(event);
};

const _showLoaded = (event) => {
  event.currentTarget.hidden = false;
};

export const repoAvatar = (repo, extra = "") => {
  const label = repo.name || "";
  const initial = _initial(label);
  return h(
    "span",
    { class: `store-repo-img store-avatar ${extra}`.trim(), style: `--repo-hue: ${_hue(label)}` },
    initial
      ? h("span", { class: "store-repo-img-initial", "aria-hidden": "true" }, initial)
      : icon("fa-puzzle-piece", "store-repo-img-icon"),
    repo.image
      ? h("img", { src: repo.image, alt: "", loading: "lazy", onLoad: _showLoaded, onError: _hideBroken })
      : null,
  );
};
