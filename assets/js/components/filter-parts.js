import { h, icon } from "../core/dom.js";

export const filterSearch = ({ id, placeholder, value, onInput, onClear }) => {
  const clear = h(
    "button",
    { type: "button", class: "filter-search-clear", "aria-label": "Clear search", hidden: !value },
    icon("fa-xmark"),
  );
  const input = h("input", {
    type: "search",
    class: "degoog-input",
    id,
    placeholder,
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": placeholder,
    value,
  });
  const reset = () => {
    input.value = "";
    clear.hidden = true;
    onClear();
    input.focus();
  };
  input.addEventListener("input", () => {
    clear.hidden = !input.value;
    onInput(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !input.value) return;
    event.stopPropagation();
    reset();
  });
  clear.addEventListener("click", reset);
  const setValue = (next) => {
    if (input.value === next) return;
    input.value = next;
    clear.hidden = !next;
  };
  return { el: h("label", { class: "filter-search" }, icon("fa-magnifying-glass"), input, clear), input, setValue };
};

export const filterToggle = ({ active, open, controls, onToggle }) =>
  h(
    "button",
    {
      type: "button",
      class: active ? "filter-toggle filter-toggle--set" : "filter-toggle",
      "aria-expanded": String(open),
      "aria-controls": controls,
      onClick: onToggle,
    },
    icon("fa-sliders"),
    h("span", {}, "Filters"),
    h("span", { class: "filter-toggle-n" }, active ? String(active) : ""),
  );

export const filterSelect = ({ label, options, value, onChange }) =>
  h(
    "span",
    { class: value ? "degoog-select-wrap filter-select filter-select--set" : "degoog-select-wrap filter-select" },
    h(
      "select",
      { class: "degoog-select", "aria-label": label, onChange: (event) => onChange(event.currentTarget.value) },
      options.map((option) => h("option", { value: option.value, selected: option.value === value }, option.label)),
    ),
  );

const _step = (event, tabs, value, onSelect) => {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  const enabled = tabs.filter((tab) => tab.count > 0 || tab.value === value);
  const index = enabled.findIndex((tab) => tab.value === value);
  const delta = event.key === "ArrowRight" ? 1 : -1;
  onSelect(enabled[(index + delta + enabled.length) % enabled.length].value, true);
};

export const filterTabs = ({ id, label, tabs, value, onSelect }) =>
  h(
    "div",
    { class: "filter-tabs", id, role: "tablist", "aria-label": label },
    tabs.map((tab) => {
      const active = tab.value === value;
      return h(
        "button",
        {
          type: "button",
          role: "tab",
          class: "filter-tab",
          "data-value": tab.value,
          "aria-selected": String(active),
          tabindex: active ? "0" : "-1",
          disabled: tab.count === 0 && !active,
          onClick: () => onSelect(tab.value, false),
          onKeydown: (event) => _step(event, tabs, value, onSelect),
        },
        tab.label,
        h("span", { class: "filter-tab-count" }, tab.count.toLocaleString()),
      );
    }),
  );

export const revealTab = (bar, focus) => {
  const active = bar?.querySelector('[aria-selected="true"]');
  if (!bar || !active) return;
  const left = active.offsetLeft;
  if (left < bar.scrollLeft || left + active.offsetWidth > bar.scrollLeft + bar.clientWidth)
    bar.scrollLeft = left - 8;
  if (focus) active.focus();
};

export const filterSummary = (onClear, ...children) =>
  h(
    "div",
    { class: "filter-summary" },
    h("span", { class: "filter-summary-text" }, ...children),
    h("button", { type: "button", class: "settings-linkish", onClick: onClear }, "Clear"),
  );
