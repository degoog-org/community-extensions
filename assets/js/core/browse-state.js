import { ALL_KINDS, hasSubtypes, isKind } from "./filters.js";

const REPO_SEPARATOR = ",";

export const emptyBrowse = () => ({ q: "", kind: ALL_KINDS, sub: "", repos: [] });

export const browseFromParams = (params, catalog) => {
  const kind = isKind(params.get("kind")) ? params.get("kind") : ALL_KINDS;
  const repos = (params.get("repos") || "")
    .split(REPO_SEPARATOR)
    .filter((id) => id && catalog.repo(id));
  return {
    q: params.get("q") || "",
    kind,
    sub: hasSubtypes(kind) ? params.get("sub") || "" : "",
    repos,
  };
};

export const browseToParams = (state) => ({
  q: state.q.trim(),
  kind: state.kind === ALL_KINDS ? "" : state.kind,
  sub: state.sub,
  repos: state.repos.join(REPO_SEPARATOR),
});
