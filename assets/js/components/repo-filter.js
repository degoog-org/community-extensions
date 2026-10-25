import { h, icon, mount } from "../core/dom.js";
import { matchesWords } from "../core/filters.js";
import { repoAvatar } from "./avatar.js";

const POP_ID = "store-repo-pop";

const _label = (catalog, selected) => {
  if (!selected.length) return "All repos";
  if (selected.length === 1) return catalog.repo(selected[0])?.name ?? "1 repo";
  return `${selected.length} repos`;
};

const _option = (repo, count, checked, onToggle) =>
  h(
    "label",
    { class: "degoog-checkbox-wrap store-repo-opt" },
    h("input", { type: "checkbox", checked, onChange: (event) => onToggle(repo.id, event.currentTarget.checked) }),
    h("span", { class: "degoog-checkbox" }, icon("fa-check")),
    repoAvatar(repo),
    h("span", { class: "store-repo-opt-name" }, repo.name),
    h("span", { class: "store-repo-opt-n" }, count.toLocaleString()),
  );

export const repoFilter = ({ catalog, counts, selected, onChange }) => {
  let query = "";
  const list = h("div", { class: "store-repo-pop-list" });
  const foot = h("div", { class: "store-repo-pop-foot" });
  const button = h(
    "button",
    { type: "button", class: "store-repo-filter-btn", "aria-haspopup": "true", "aria-expanded": "false", "aria-controls": POP_ID },
    _label(catalog, selected),
  );
  const search = h("input", {
    type: "text",
    class: "degoog-input",
    placeholder: "Find a repo",
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "Find a repo",
  });
  const pop = h(
    "div",
    { class: "degoog-dropdown store-repo-pop", id: POP_ID, role: "group", "aria-label": "Show extensions from", hidden: true },
    h("div", { class: "store-repo-pop-head" }, icon("fa-magnifying-glass"), search),
    list,
    foot,
  );
  const root = h(
    "span",
    { class: `degoog-select-wrap filter-select store-repo-filter${selected.length ? " filter-select--set" : ""}` },
    button,
    pop,
  );

  const toggle = (id, on) => onChange(on ? [...selected, id] : selected.filter((s) => s !== id));

  const paintList = () => {
    const repos = catalog.repos.filter((repo) => matchesWords([repo.name, repo.displayUrl], query));
    mount(
      list,
      repos.length
        ? repos.map((repo) => _option(repo, counts.get(repo.id) ?? 0, selected.includes(repo.id), toggle))
        : h("p", { class: "store-repo-pop-empty" }, `No repo matches "${query.trim()}".`),
    );
    mount(
      foot,
      h("span", {}, selected.length ? `${selected.length} selected` : "Showing every repo"),
      selected.length ? h("button", { type: "button", class: "settings-linkish", onClick: () => onChange([]) }, "Clear") : null,
    );
  };

  const close = () => {
    if (pop.hidden) return;
    pop.hidden = true;
    button.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", outside);
    document.removeEventListener("keydown", escape);
  };

  const outside = (event) => {
    if (!root.contains(event.target)) close();
  };

  const escape = (event) => {
    if (event.key !== "Escape") return;
    close();
    button.focus();
  };

  const open = () => {
    paintList();
    pop.hidden = false;
    button.setAttribute("aria-expanded", "true");
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    search.focus();
  };

  button.addEventListener("click", () => (pop.hidden ? open() : close()));
  search.addEventListener("input", () => {
    query = search.value;
    paintList();
  });

  const update = (next) => {
    selected = next.selected;
    counts = next.counts;
    button.textContent = _label(catalog, selected);
    root.classList.toggle("filter-select--set", selected.length > 0);
    if (!pop.hidden) paintList();
  };

  return { el: root, update, close };
};
