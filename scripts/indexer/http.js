import { REQUEST_RETRIES, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from "./config.js";
import { logger } from "./logger.js";

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const _attempt = async (url, headers) => {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (res.ok) return { res };
  return { status: res.status, retry: RETRYABLE_STATUS.has(res.status) };
};

const request = async (url, headers = {}) => {
  for (let tries = 0; tries <= REQUEST_RETRIES; tries++) {
    try {
      const out = await _attempt(url, headers);
      if (out.res) return out.res;
      if (!out.retry) return null;
    } catch (err) {
      logger.warn("http", `request failed for ${url}`, err);
    }
    await _sleep(RETRY_DELAY_MS * (tries + 1));
  }
  return null;
};

export const getJson = async (url, headers) => {
  const res = await request(url, headers);
  if (!res) return null;
  try {
    return await res.json();
  } catch (err) {
    logger.warn("http", `invalid json at ${url}`, err);
    return null;
  }
};

export const getText = async (url, headers) => {
  const res = await request(url, headers);
  if (!res) return null;
  try {
    return await res.text();
  } catch (err) {
    logger.warn("http", `unreadable body at ${url}`, err);
    return null;
  }
};

export const pool = async (list, limit, worker) => {
  const results = new Array(list.length);
  let next = 0;
  const lane = async () => {
    while (next < list.length) {
      const index = next++;
      results[index] = await worker(list[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, lane));
  return results;
};
