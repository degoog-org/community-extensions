import { GITEA_FALLBACK_REFS, PATH_TOKEN } from "../config.js";
import { getJson } from "../http.js";

const _trim = (file) => file.replace(/^\/+/, "");

const _treeAt = async (base, path, ref) => {
  const url = `${base}/api/v1/repos/${path}/git/trees/${encodeURIComponent(ref)}?recursive=true&per_page=10000`;
  const data = await getJson(url);
  if (!data || !Array.isArray(data.tree)) return null;
  const paths = data.tree.filter((e) => e.type === "blob").map((e) => e.path);
  return paths.length ? paths : null;
};

const _tree = async (base, path) => {
  const meta = await getJson(`${base}/api/v1/repos/${path}`);
  const branch = meta?.default_branch || GITEA_FALLBACK_REFS[0];
  const refs = [branch, ...GITEA_FALLBACK_REFS.filter((r) => r !== branch)];
  for (const ref of refs) {
    const paths = await _treeAt(base, path, ref);
    if (paths) return { paths, ref };
  }
  return null;
};

export const makeGitea = (hostname, id = "gitea", label = `Gitea (${hostname})`) => {
  const base = `https://${hostname}`;
  return {
    id,
    label,
    matches: (h) => h === hostname,
    locate: (_hostname, path) => ({
      hostname,
      path,
      webUrl: `${base}/${path}`,
      gitUrl: `${base}/${path}.git`,
      displayUrl: `${hostname}/${path}`,
    }),
    tree: (loc) => _tree(base, loc.path),
    raw: (loc, ref, file) =>
      `${base}/api/v1/repos/${loc.path}/raw/${_trim(file)}?ref=${encodeURIComponent(ref)}`,
    source: (loc, ref, dir) => `${loc.webUrl}/src/branch/${ref}/${_trim(dir)}`,
    blob: (loc, ref, file) => `${loc.webUrl}/src/branch/${ref}/${_trim(file)}`,
    patterns: (loc, ref) => ({
      raw: `${base}/api/v1/repos/${loc.path}/raw/${PATH_TOKEN}?ref=${encodeURIComponent(ref)}`,
      blob: `${loc.webUrl}/src/branch/${ref}/${PATH_TOKEN}`,
    }),
  };
};

export const isGitea = async (hostname) => {
  const data = await getJson(`https://${hostname}/api/v1/version`, {
    accept: "application/json",
  });
  return typeof data?.version === "string";
};
