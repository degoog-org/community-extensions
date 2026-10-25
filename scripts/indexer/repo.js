import { OFFICIAL_REPO_ID } from "../../assets/js/core/kinds.js";
import { FILE_CONCURRENCY } from "./config.js";
import { resolveRepo } from "./hosts/index.js";
import { getJson, pool } from "./http.js";
import { buildItem, manifestEntries } from "./items.js";

const ABSOLUTE_URL = /^(https?:)?\/\/|^data:/i;

const _str = (value) => (typeof value === "string" ? value.trim() : "");

const _image = (ctx, value) => {
  const img = _str(value);
  if (!img) return null;
  return ABSOLUTE_URL.test(img) ? img : ctx.raw(img.replace(/^\.?\/+/, ""));
};

const _context = (host, loc, tree, pkg) => {
  const repoId = `${loc.hostname}/${loc.path}`.toLowerCase();
  const author = _str(pkg.author) ? { name: _str(pkg.author), url: null } : null;
  return {
    repoId,
    author,
    paths: tree.paths,
    raw: (file) => host.raw(loc, tree.ref, file),
    blob: (file) => host.blob(loc, tree.ref, file),
    source: (dir) => host.source(loc, tree.ref, dir),
  };
};

const _repoEntry = (input, host, loc, tree, ctx, pkg, count) => ({
  id: ctx.repoId,
  input,
  name: _str(pkg.name) || loc.path.split("/").pop(),
  description: _str(pkg.description),
  author: ctx.author,
  image: _image(ctx, pkg["repo-image"]),
  official: ctx.repoId === OFFICIAL_REPO_ID,
  host: host.id,
  hostLabel: host.label,
  webUrl: loc.webUrl,
  gitUrl: loc.gitUrl,
  displayUrl: loc.displayUrl,
  links: host.patterns(loc, tree.ref),
  itemCount: count,
});

export const crawlRepo = async (input) => {
  const resolved = await resolveRepo(input);
  if (!resolved) throw new Error("unsupported or invalid repository url");
  const { host, loc } = resolved;
  const tree = await host.tree(loc);
  if (!tree) throw new Error(`could not list files for ${loc.displayUrl}`);
  const pkg = await getJson(host.raw(loc, tree.ref, "package.json"));
  if (!pkg || typeof pkg !== "object") throw new Error(`no readable package.json in ${loc.displayUrl}`);
  const ctx = _context(host, loc, tree, pkg);
  const built = await pool(manifestEntries(pkg), FILE_CONCURRENCY, (spec) => buildItem(ctx, spec));
  const items = built.filter(Boolean);
  return {
    repo: _repoEntry(input, host, loc, tree, ctx, pkg, items.length),
    items,
  };
};
