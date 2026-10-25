export const Route = Object.freeze({
  BROWSE: "browse",
  REPOS: "repos",
  EXTENSION: "extension",
  SUBMIT: "submit",
  LEGACY: "legacy",
  NOT_FOUND: "not-found",
});

const PATHS = Object.freeze({
  [Route.BROWSE]: "/",
  [Route.REPOS]: "/repos",
  [Route.SUBMIT]: "/submit",
});

const EXTENSION_PREFIX = "/extension/";
const LEGACY_HASH = /^repo=/;

const _split = (hash) => {
  const raw = hash.replace(/^#/, "");
  const at = raw.indexOf("?");
  const path = at < 0 ? raw : raw.slice(0, at);
  const query = at < 0 ? "" : raw.slice(at + 1);
  return { path: path || "/", params: new URLSearchParams(query) };
};

export const parseRoute = (hash = location.hash) => {
  const raw = hash.replace(/^#/, "");
  if (LEGACY_HASH.test(raw)) return { name: Route.LEGACY, params: new URLSearchParams(raw) };
  const { path, params } = _split(hash);
  if (path.startsWith(EXTENSION_PREFIX)) {
    const id = decodeURIComponent(path.slice(EXTENSION_PREFIX.length));
    return { name: Route.EXTENSION, id, params };
  }
  const name = Object.keys(PATHS).find((key) => PATHS[key] === path);
  return { name: name ?? Route.NOT_FOUND, params };
};

const _withQuery = (path, params) => {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  ).toString();
  return `#${path}${query ? `?${query}` : ""}`;
};

export const hrefFor = (name, params) => _withQuery(PATHS[name], params);

export const extensionHref = (id) => `#${EXTENSION_PREFIX}${encodeURI(id)}`;

export const go = (href) => {
  if (location.hash === href) return;
  location.hash = href;
};

export const replaceQuery = (href) => {
  if (location.hash === href) return;
  history.replaceState(history.state, "", href);
};

let lastStoreHref = hrefFor(Route.BROWSE);

export const rememberStore = (url) => {
  const hash = new URL(url).hash || "#/";
  const name = parseRoute(hash).name;
  if (name === Route.BROWSE || name === Route.REPOS) lastStoreHref = hash;
};

export const storeHref = () => lastStoreHref;
