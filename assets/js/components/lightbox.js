import { h, icon } from "../core/dom.js";

const state = { urls: [], index: 0, name: "", opener: null };
let refs = null;

const _counter = () =>
  state.urls.length > 1 ? `${state.name} · ${state.index + 1} / ${state.urls.length}` : state.name;

const _paint = () => {
  const { root, img, prev, next, counter } = refs;
  const many = state.urls.length > 1;
  img.src = state.urls[state.index] ?? "";
  img.alt = `Screenshot ${state.index + 1} of ${state.name}`;
  prev.hidden = !many;
  next.hidden = !many;
  counter.textContent = _counter();
  root.setAttribute("aria-hidden", "false");
  root.classList.add("store-lightbox--open");
};

const closeShot = () => {
  if (!refs?.root.classList.contains("store-lightbox--open")) return;
  refs.root.classList.remove("store-lightbox--open");
  refs.root.setAttribute("aria-hidden", "true");
  state.opener?.focus?.();
};

const _step = (delta) => {
  const n = state.urls.length;
  if (n < 2) return;
  state.index = (state.index + delta + n) % n;
  _paint();
};

const _onKey = (event) => {
  if (!refs.root.classList.contains("store-lightbox--open")) return;
  if (event.key === "Escape") closeShot();
  if (event.key === "ArrowLeft") _step(-1);
  if (event.key === "ArrowRight") _step(1);
};

const _build = () => {
  const img = h("img", { class: "store-lightbox-img", alt: "" });
  const close = h("button", { class: "store-lightbox-close", type: "button", "aria-label": "Close", onClick: closeShot }, "×");
  const prev = h("button", { class: "store-lightbox-prev", type: "button", "aria-label": "Previous screenshot", onClick: () => _step(-1) }, icon("fa-arrow-left"));
  const next = h("button", { class: "store-lightbox-next", type: "button", "aria-label": "Next screenshot", onClick: () => _step(1) }, icon("fa-arrow-right"));
  const counter = h("div", { class: "store-lightbox-counter" });
  const root = h(
    "div",
    { class: "store-lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Screenshots", "aria-hidden": "true" },
    h("div", { class: "store-lightbox-backdrop", onClick: closeShot }),
    close,
    prev,
    h("div", { class: "store-lightbox-img-wrap" }, img),
    next,
    counter,
  );
  document.body.append(root);
  document.addEventListener("keydown", _onKey);
  return { root, img, prev, next, counter, close };
};

export const openShots = (urls, name, index = 0) => {
  if (!urls.length) return;
  refs ??= _build();
  Object.assign(state, { urls, name, index, opener: document.activeElement });
  _paint();
  refs.close.focus();
};

export { closeShot };
