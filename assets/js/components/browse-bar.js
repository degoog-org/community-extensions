import { h, mount } from "../core/dom.js";
import { ALL_KINDS, kindSubtypes, passes } from "../core/filters.js";
import { ITEM_KINDS } from "../core/kinds.js";
import { extensionsCount, kindsLabel, subtypeLabel } from "../core/labels.js";
import { filterSearch, filterSelect, filterSummary, filterTabs, filterToggle, revealTab } from "./filter-parts.js";
import { repoFilter } from "./repo-filter.js";

export const SEARCH_ID = "store-q";
const TABS_ID = "store-kinds";
const SELECTS_ID = "store-selects";
const NAMES_SHOWN = 2;

const _repoCounts = (catalog, state) => {
  const counts = new Map();
  catalog.items
    .filter((item) => passes({ ...state, repos: [] }, item, false))
    .forEach((item) => counts.set(item.repoId, (counts.get(item.repoId) ?? 0) + 1));
  return counts;
};

const _subSelect = (catalog, state, actions) => {
  const subs = kindSubtypes(catalog.items, state.kind);
  if (!subs.length) return null;
  const noun = kindsLabel(state.kind).toLowerCase().replace(/s$/, "");
  return filterSelect({
    label: `${noun} type`,
    value: state.sub,
    onChange: actions.setSub,
    options: [
      { value: "", label: `All ${noun} types` },
      ...subs.map((sub) => ({ value: sub, label: subtypeLabel(state.kind, sub) })),
    ],
  });
};

const _tabs = (catalog, state, actions) => {
  const scoped = catalog.items.filter((item) => passes(state, item, false));
  return filterTabs({
    id: TABS_ID,
    label: "Extension kind",
    value: state.kind,
    onSelect: actions.setKind,
    tabs: [
      { value: ALL_KINDS, label: "All", count: scoped.length },
      ...ITEM_KINDS.map((kind) => ({
        value: kind,
        label: kindsLabel(kind),
        count: scoped.filter((item) => item.kind === kind).length,
      })),
    ],
  });
};

const _repoNames = (catalog, ids) => {
  const names = ids.map((id) => catalog.repo(id)?.name ?? id);
  const shown = names.slice(0, NAMES_SHOWN);
  const rest = names.length - shown.length;
  return [
    shown.map((name, i) => [i === 0 ? "" : i === shown.length - 1 && !rest ? " and " : ", ", h("b", {}, name)]),
    rest ? ` and ${rest} more` : "",
  ];
};

const _summary = (catalog, state, count, actions) => {
  const q = state.q.trim();
  const parts = [];
  if (q) parts.push(`matching "${q}"`);
  if (state.sub) parts.push(`of type ${subtypeLabel(state.kind, state.sub)}`);
  if (!parts.length && !state.repos.length) return null;
  const before = [extensionsCount(count), parts.join(", ")].filter(Boolean).join(" ");
  return filterSummary(
    actions.clear,
    before,
    state.repos.length ? [`${parts.length ? ", " : " "}from `, _repoNames(catalog, state.repos)] : null,
  );
};

export const browseBar = (catalog, state, actions) => {
  let open = false;
  const search = filterSearch({
    id: SEARCH_ID,
    placeholder: "Search extensions",
    value: state.q,
    onInput: actions.setQuery,
    onClear: () => actions.setQuery(""),
  });
  const repos = repoFilter({
    catalog,
    counts: _repoCounts(catalog, state),
    selected: state.repos,
    onChange: actions.setRepos,
  });
  const toggleSlot = h("span", { class: "filter-toggle-slot" });
  const subSlot = h("span", { class: "filter-sub-slot" });
  const selects = h("div", { class: "filter-selects", id: SELECTS_ID }, subSlot, repos.el);
  const tabsSlot = h("div");
  const summarySlot = h("div");
  const bar = h(
    "div",
    { class: "filter-bar" },
    h("div", { class: "filter-bar-top" }, search.el, toggleSlot, selects),
    tabsSlot,
    summarySlot,
  );

  const paintToggle = (current) =>
    mount(
      toggleSlot,
      filterToggle({
        active: [current.sub, current.repos.length].filter(Boolean).length,
        open,
        controls: SELECTS_ID,
        onToggle: () => {
          open = !open;
          bar.classList.toggle("filter-bar--open", open);
          paintToggle(current);
        },
      }),
    );

  const update = (current, count, focusTab = false) => {
    search.setValue(current.q);
    paintToggle(current);
    mount(subSlot, _subSelect(catalog, current, actions));
    subSlot.hidden = !subSlot.childElementCount;
    repos.update({ selected: current.repos, counts: _repoCounts(catalog, current) });
    mount(tabsSlot, _tabs(catalog, current, actions));
    mount(summarySlot, _summary(catalog, current, count, actions));
    revealTab(tabsSlot.firstElementChild, focusTab);
  };

  return { el: h("div", { class: "filter-bar-wrap" }, bar), update, input: search.input };
};
