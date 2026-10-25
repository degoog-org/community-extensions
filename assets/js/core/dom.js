const BOOLEAN_ATTRS = new Set(["hidden", "disabled", "checked", "selected", "open"]);

const _setProp = (el, key, value) => {
  if (value === null || value === undefined || value === false) return;
  if (key === "class") return (el.className = value);
  if (key === "style") return el.setAttribute("style", value);
  if (key === "html") return (el.innerHTML = value);
  if (key.startsWith("on") && typeof value === "function")
    return el.addEventListener(key.slice(2).toLowerCase(), value);
  if (BOOLEAN_ATTRS.has(key)) return (el[key] = Boolean(value));
  if (key === "value") return (el.value = value);
  el.setAttribute(key, value === true ? "" : String(value));
};

const _append = (el, child) => {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) return child.forEach((c) => _append(el, c));
  el.append(child instanceof Node ? child : document.createTextNode(String(child)));
};

export const h = (tag, props = {}, ...children) => {
  const el = document.createElement(tag);
  Object.entries(props || {}).forEach(([key, value]) => _setProp(el, key, value));
  _append(el, children);
  return el;
};

export const icon = (name, extra = "") =>
  h("i", { class: `fa-solid ${name}${extra ? ` ${extra}` : ""}`, "aria-hidden": "true" });

export const brand = (name) => h("i", { class: `fa-brands ${name}`, "aria-hidden": "true" });

export const mount = (target, ...children) => {
  target.replaceChildren();
  _append(target, children);
  return target;
};

export const externalLink = (href, props, ...children) =>
  h("a", { href, target: "_blank", rel: "noopener noreferrer", ...props }, ...children);
