import { browseBar } from "../components/browse-bar.js";
import { results } from "../components/results.js";
import { viewsSwitch } from "../components/views-switch.js";
import { browseFromParams, browseToParams, emptyBrowse } from "../core/browse-state.js";
import { SEARCH_DEBOUNCE_MS } from "../core/config.js";
import { h, mount } from "../core/dom.js";
import { ALL_KINDS, isFiltered, passes } from "../core/filters.js";
import { Route, hrefFor, replaceQuery } from "../core/router.js";

const _list = (catalog, state) => catalog.items.filter((item) => passes(state, item));

export const renderBrowse = (root, catalog, route) => {
  let state = browseFromParams(route.params, catalog);
  let timer = 0;
  const resultsSlot = h("div");

  const paint = (focusTab = false) => {
    const list = _list(catalog, state);
    bar.update(state, list.length, focusTab);
    mount(
      resultsSlot,
      results({
        list,
        q: state.q,
        preview: state.kind === ALL_KINDS && !state.q.trim(),
        filtered: isFiltered(state),
        onShowAll: (kind) => actions.setKind(kind, false, true),
        onClear: actions.clear,
      }),
    );
  };

  const commit = (patch, focusTab = false, scroll = false) => {
    state = { ...state, ...patch };
    replaceQuery(hrefFor(Route.BROWSE, browseToParams(state)));
    paint(focusTab);
    if (scroll) bar.el.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const actions = {
    setQuery: (q) => {
      clearTimeout(timer);
      state = { ...state, q };
      timer = setTimeout(() => commit({}), SEARCH_DEBOUNCE_MS);
    },
    setKind: (kind, focus, scroll) => commit({ kind, sub: "" }, focus, scroll),
    setSub: (sub) => commit({ sub }),
    setRepos: (repos) => commit({ repos }),
    clear: () => commit({ ...emptyBrowse(), kind: state.kind }),
  };

  const bar = browseBar(catalog, state, actions);
  mount(root, h("div", { class: "store" }, viewsSwitch(catalog, Route.BROWSE), bar.el, resultsSlot));
  paint();
  return { focusSearch: () => bar.input.focus() };
};
