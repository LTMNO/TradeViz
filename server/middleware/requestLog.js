const MAX_LOGS = 200;
const logs = [];

export function requestLogger(req, res, next) {
  const start = Date.now();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method: req.method,
    path: req.originalUrl || req.url,
    timestamp: new Date().toISOString(),
    status: null,
    duration_ms: null,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
  };

  res.on('finish', () => {
    entry.status = res.statusCode;
    entry.duration_ms = Date.now() - start;
    logs.unshift(entry);
    if (logs.length > MAX_LOGS) logs.pop();
  });

  next();
}

function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const copy = { ...body };
  return copy;
}

export function getRequestLogs() {
  return logs;
}

export function clearRequestLogs() {
  logs.length = 0;
}
