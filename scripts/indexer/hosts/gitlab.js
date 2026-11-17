import {
  ENCODED_PATH_TOKEN,
  GITEA_FALLBACK_REFS,
  GITLAB_MAX_PAGES,
  GITLAB_PAGE_SIZE,
  PATH_TOKEN,
} from "../config.js";
import { getJson, getPage } from "../http.js";

const API = "https://gitlab.com/api/v4/projects";

const _trim = (file) => file.replace(/^\/+/, "");

const _pagesAt = async (project, ref) => {
  const paths = [];
  const dirs = {};
  for (let page = 1; page <= GITLAB_MAX_PAGES; page++) {
    const url = `${API}/${project}/repository/tree?recursive=true&per_page=${GITLAB_PAGE_SIZE}&ref=${encodeURIComponent(ref)}&page=${page}`;
    const data = await getJson(url);
    if (!Array.isArray(data) || !data.length) break;
    data.filter((e) => e.type === "blob").forEach((e) => paths.push(e.path));
    data.filter((e) => e.type === "tree").forEach((e) => (dirs[e.path] = e.id));
    if (data.length < GITLAB_PAGE_SIZE) break;
  }
  return paths.length ? { paths, dirs } : null;
};

const _tree = async (path) => {
  const project = encodeURIComponent(path);
  const meta = await getJson(`${API}/${project}`);
  const refs = meta?.default_branch ? [meta.default_branch] : GITEA_FALLBACK_REFS;
  for (const ref of refs) {
    const found = await _pagesAt(project, ref);
    if (found) return { ...found, ref };
  }
  return null;
};

export const gitlab = {
  id: "gitlab",
  label: "GitLab",
  matches: (hostname) => hostname === "gitlab.com",
  locate: (_hostname, path) => ({
    hostname: "gitlab.com",
    path,
    webUrl: `https://gitlab.com/${path}`,
    gitUrl: `https://gitlab.com/${path}.git`,
    displayUrl: `gitlab.com/${path}`,
  }),
  tree: (loc) => _tree(loc.path),
  commits: (loc, ref, dir, page, size) =>
    getPage(
      `${API}/${encodeURIComponent(loc.path)}/repository/commits?ref_name=${encodeURIComponent(ref)}&path=${encodeURIComponent(_trim(dir))}&per_page=${size}&page=${page}`,
    ),
  commitDate: (commit) => commit?.committed_date ?? null,
  raw: (loc, ref, file) =>
    `${API}/${encodeURIComponent(loc.path)}/repository/files/${encodeURIComponent(_trim(file))}/raw?ref=${encodeURIComponent(ref)}`,
  source: (loc, ref, dir) => `${loc.webUrl}/-/tree/${ref}/${_trim(dir)}`,
  blob: (loc, ref, file) => `${loc.webUrl}/-/blob/${ref}/${_trim(file)}`,
  patterns: (loc, ref) => ({
    raw: `${API}/${encodeURIComponent(loc.path)}/repository/files/${ENCODED_PATH_TOKEN}/raw?ref=${encodeURIComponent(ref)}`,
    blob: `${loc.webUrl}/-/blob/${ref}/${PATH_TOKEN}`,
  }),
};
