import { GITHUB_TOKEN, PATH_TOKEN } from "../config.js";
import { getJson } from "../http.js";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

const _headers = () => ({
  accept: "application/vnd.github+json",
  ...(GITHUB_TOKEN ? { authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
});

const _trim = (file) => file.replace(/^\/+/, "");

export const github = {
  id: "github",
  label: "GitHub",
  matches: (hostname) => hostname === "github.com" || hostname === "www.github.com",
  locate: (_hostname, path) => ({
    hostname: "github.com",
    path,
    webUrl: `https://github.com/${path}`,
    gitUrl: `https://github.com/${path}.git`,
    displayUrl: `github.com/${path}`,
  }),
  tree: async (loc) => {
    const data = await getJson(`${API}/repos/${loc.path}/git/trees/HEAD?recursive=1`, _headers());
    if (!data || !Array.isArray(data.tree)) return null;
    const paths = data.tree.filter((e) => e.type === "blob").map((e) => e.path);
    return paths.length ? { paths, ref: "HEAD" } : null;
  },
  raw: (loc, ref, file) => `${RAW}/${loc.path}/${ref}/${_trim(file)}`,
  source: (loc, _ref, dir) => `${loc.webUrl}/tree/HEAD/${_trim(dir)}`,
  blob: (loc, _ref, file) => `${loc.webUrl}/blob/HEAD/${_trim(file)}`,
  patterns: (loc, ref) => ({
    raw: `${RAW}/${loc.path}/${ref}/${PATH_TOKEN}`,
    blob: `${loc.webUrl}/blob/HEAD/${PATH_TOKEN}`,
  }),
};
