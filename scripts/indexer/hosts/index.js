import { github } from "./github.js";
import { gitlab } from "./gitlab.js";
import { isGitea, makeGitea } from "./gitea.js";
import { logger } from "../logger.js";

const KNOWN_HOSTS = [github, gitlab, makeGitea("codeberg.org", "codeberg", "Codeberg")];
const OWNER_REPO = /^[a-z0-9._-]+\/[a-z0-9._-]+$/i;

const detected = new Map();

const _normalize = (input) => {
  const value = String(input || "").trim();
  if (/^[a-z]+:\/\//i.test(value)) return value;
  return OWNER_REPO.test(value) ? `https://github.com/${value}` : null;
};

const _detect = async (hostname) => {
  if (detected.has(hostname)) return detected.get(hostname);
  const host = (await isGitea(hostname)) ? makeGitea(hostname) : null;
  detected.set(hostname, host);
  return host;
};

export const resolveRepo = async (input) => {
  const normalized = _normalize(input);
  if (!normalized) return null;
  let url;
  try {
    url = new URL(normalized);
  } catch (err) {
    logger.warn("hosts", `invalid store url ${input}`, err);
    return null;
  }
  const hostname = url.hostname.toLowerCase();
  const path = url.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/i, "");
  if (!path) return null;
  const host = KNOWN_HOSTS.find((h) => h.matches(hostname)) || (await _detect(hostname));
  if (!host) return null;
  return { host, loc: host.locate(hostname, path) };
};
