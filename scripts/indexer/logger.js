const LogLevel = Object.freeze({
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
});

const _write = (level, scope, message, err) => {
  const line = `[${level}] [${scope}] ${message}`;
  const detail = err instanceof Error ? ` (${err.message})` : "";
  const out = level === LogLevel.INFO ? console.log : console.error;
  out(line + detail);
};

export const logger = {
  info: (scope, message) => _write(LogLevel.INFO, scope, message),
  warn: (scope, message, err) => _write(LogLevel.WARN, scope, message, err),
  error: (scope, message, err) => _write(LogLevel.ERROR, scope, message, err),
};
