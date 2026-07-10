const WINDOW_MS = 10 * 60 * 1000;
const stores = globalThis.__exposureRateLimitStores || new Map();
globalThis.__exposureRateLimitStores = stores;

export function prepareApi(req, res, options = {}) {
  const methods = options.methods || ['POST'];
  const limit = Number(options.limit || 30);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  if (origin) {
    res.setHeader('Vary', 'Origin');
    if (isAllowedOrigin(req, origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', methods.concat('OPTIONS').join(', '));
    }
  }

  if (req.method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(req, origin)) {
      res.status(403).json({ error: 'ORIGIN_NOT_ALLOWED' });
      return false;
    }
    res.status(204).end();
    return false;
  }

  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: `${methods.join(' or ')} only` });
    return false;
  }

  if (origin && !isAllowedOrigin(req, origin)) {
    res.status(403).json({ error: 'ORIGIN_NOT_ALLOWED' });
    return false;
  }

  if (requestSize(req) > Number(options.maxBodyBytes || 24_000)) {
    res.status(413).json({ error: 'REQUEST_TOO_LARGE' });
    return false;
  }

  const rate = consumeRateLimit(req, options.bucket || 'default', limit);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));

  if (!rate.allowed) {
    res.setHeader('Retry-After', String(Math.ceil(rate.retryAfterMs / 1000)));
    res.status(429).json({ error: 'RATE_LIMITED', retryAfterMs: rate.retryAfterMs });
    return false;
  }

  return true;
}

function isAllowedOrigin(req, origin) {
  const configured = String(process.env.APP_ORIGIN || '')
    .split(',')
    .map(value => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const forwardedHost = firstHeader(req.headers['x-forwarded-host']);
  const host = forwardedHost || firstHeader(req.headers.host);
  const protocol = firstHeader(req.headers['x-forwarded-proto']) || 'https';
  const sameOrigin = host ? `${protocol}://${host}` : '';
  const cleanOrigin = origin.replace(/\/$/, '');

  return cleanOrigin === sameOrigin || configured.includes(cleanOrigin);
}

function requestSize(req) {
  const contentLength = Number(firstHeader(req.headers['content-length']) || 0);
  if (contentLength) return contentLength;
  try {
    return Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function consumeRateLimit(req, bucket, limit) {
  const now = Date.now();
  const ip = firstHeader(req.headers['x-forwarded-for'])?.split(',')[0]?.trim()
    || firstHeader(req.headers['x-real-ip'])
    || req.socket?.remoteAddress
    || 'unknown';
  const key = `${bucket}:${ip}`;
  const current = stores.get(key);

  if (!current || current.resetAt <= now) {
    stores.set(key, { count: 1, resetAt: now + WINDOW_MS });
    cleanup(now);
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterMs: WINDOW_MS };
  }

  current.count += 1;
  stores.set(key, current);
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfterMs: Math.max(0, current.resetAt - now)
  };
}

function cleanup(now) {
  if (stores.size < 500) return;
  for (const [key, value] of stores.entries()) {
    if (value.resetAt <= now) stores.delete(key);
  }
}

function firstHeader(value) {
  return Array.isArray(value) ? value[0] : value;
}
