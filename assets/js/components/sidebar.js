import { Route, hrefFor, storeHref } from "../core/router.js";

const NavKey = Object.freeze({
  STORE: "store",
  SUBMIT: "submit",
});

const ROUTE_NAV = Object.freeze({
  [Route.BROWSE]: NavKey.STORE,
  [Route.REPOS]: NavKey.STORE,
  [Route.EXTENSION]: NavKey.STORE,
  [Route.SUBMIT]: NavKey.SUBMIT,
});

const EXTERNAL_PREFIX = "ext:";

export const sidebar = () => {
  const items = [...document.querySelectorAll("[data-nav]")];
  const select = document.getElementById("nav-select");

  select?.addEventListener("change", () => {
    const value = select.value;
    if (value.startsWith(EXTERNAL_PREFIX)) {
      window.open(value.slice(EXTERNAL_PREFIX.length), "_blank", "noopener");
      return;
    }
    location.hash = value === NavKey.SUBMIT ? hrefFor(Route.SUBMIT) : storeHref();
  });

  const setActive = (routeName) => {
    const key = ROUTE_NAV[routeName] ?? "";
    items.forEach((el) => {
      if (el.dataset.nav === NavKey.STORE)
        el.setAttribute("href", key === NavKey.STORE ? hrefFor(Route.BROWSE) : storeHref());
      const on = el.dataset.nav === key;
      el.classList.toggle("active", on);
      if (on) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    if (select && key) select.value = key;
  };

  return { setActive };
};
