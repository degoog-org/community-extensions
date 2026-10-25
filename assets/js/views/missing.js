import { h, mount } from "../core/dom.js";
import { Route, hrefFor } from "../core/router.js";

export const renderMissing = (root, message = "There's nothing at this address.") => {
  mount(
    root,
    h(
      "div",
      { class: "site-error" },
      h("h2", {}, "Not found"),
      h("p", {}, message),
      h("a", { class: "degoog-btn degoog-btn--secondary degoog-btn--sm", href: hrefFor(Route.BROWSE) }, "Browse extensions"),
    ),
  );
  return {};
};

export const renderBroken = (root, retry) => {
  mount(
    root,
    h(
      "div",
      { class: "site-error" },
      h("h2", {}, "The catalog didn't load"),
      h("p", {}, "Check your connection and try again."),
      h("button", { type: "button", class: "degoog-btn degoog-btn--secondary degoog-btn--sm", onClick: retry }, "Try again"),
    ),
  );
};
