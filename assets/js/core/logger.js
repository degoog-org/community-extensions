const PREFIX = "[dce]";

export const logger = {
  info: (scope, message) => console.info(`${PREFIX} [${scope}] ${message}`),
  warn: (scope, message, err) => console.warn(`${PREFIX} [${scope}] ${message}`, err ?? ""),
  error: (scope, message, err) => console.error(`${PREFIX} [${scope}] ${message}`, err ?? ""),
};
