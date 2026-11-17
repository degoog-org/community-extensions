import { HISTORY_MAX_PAGES, HISTORY_PAGE_SIZE } from "./config.js";

const LAST_PAGE = /<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/;

const _iso = (value) => {
  const time = Date.parse(value ?? "");
  return Number.isNaN(time) ? null : new Date(time).toISOString();
};

const _lastPage = (headers) => Number(LAST_PAGE.exec(headers?.get("link") || "")?.[1]) || 1;

const _walkOldest = async (ctx, dir) => {
  let oldest = null;
  for (let page = 1; page <= HISTORY_MAX_PAGES; page++) {
    const list = (await ctx.commits(dir, page, HISTORY_PAGE_SIZE))?.data;
    if (!Array.isArray(list) || !list.length) break;
    oldest = list[list.length - 1];
    if (list.length < HISTORY_PAGE_SIZE) break;
  }
  return oldest;
};

const _oldest = async (ctx, dir, last) => {
  const tail = (await ctx.commits(dir, last, 1))?.data?.[0];
  return tail ?? (await _walkOldest(ctx, dir));
};

const _history = async (ctx, dir, withAdded) => {
  const latest = await ctx.commits(dir, 1, 1);
  const updatedAt = _iso(ctx.commitDate(latest?.data?.[0]));
  if (!withAdded || !updatedAt) return { addedAt: null, updatedAt };
  const last = _lastPage(latest.headers);
  if (last <= 1) return { addedAt: updatedAt, updatedAt };
  return { addedAt: _iso(ctx.commitDate(await _oldest(ctx, dir, last))), updatedAt };
};

export const stampItem = async (ctx, item, before, firstSeen) => {
  const sha = ctx.dirs[item.path] ?? null;
  if (sha && before?.sha === sha && before.addedAt && before.updatedAt) {
    return { ...item, sha, addedAt: before.addedAt, updatedAt: before.updatedAt };
  }
  const knownAdded = before ? before.addedAt ?? null : firstSeen;
  const log = await _history(ctx, item.path, !knownAdded);
  return {
    ...item,
    sha,
    addedAt: knownAdded ?? log.addedAt,
    updatedAt: log.updatedAt ?? before?.updatedAt ?? null,
  };
};
