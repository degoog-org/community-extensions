import { THEME_ICONS, THEME_KEY, THEME_LABELS, THEME_ORDER, Theme } from "./config.js";
import { logger } from "./logger.js";

const _stored = () => {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return THEME_ORDER.includes(value) ? value : Theme.SYSTEM;
  } catch (err) {
    logger.warn("theme", "could not read the stored theme", err);
    return Theme.SYSTEM;
  }
};

const _store = (theme) => {
  try {
    if (theme === Theme.SYSTEM) localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    logger.warn("theme", "could not save the theme", err);
  }
};

const _apply = (theme) => {
  if (theme === Theme.SYSTEM) document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
};

const _paint = (buttons, theme) => {
  buttons.forEach((btn) => {
    const label = THEME_LABELS[theme];
    btn.querySelector("i")?.setAttribute("class", `fa-solid ${THEME_ICONS[theme]}`);
    btn.setAttribute("aria-label", `${label}, click to switch`);
    const text = btn.querySelector("[data-theme-label]");
    if (text) text.textContent = label;
  });
};

export const lumos = (buttons) => {
  let theme = _stored();
  _paint(buttons, theme);
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      theme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
      _apply(theme);
      _store(theme);
      _paint(buttons, theme);
    }),
  );
};
