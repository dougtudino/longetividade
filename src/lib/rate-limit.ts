// Rate limit in-memory (sliding window).
// OK pra Railway single-instance. Para scale horizontal, migrar pra Redis.
//
// Uso:
//   const ok = rateLimit("checkout", ip, { windowMs: 60_000, max: 5 });
//   if (!ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

type Bucket = { hits: number[]; // timestamps
};

const store = new Map<string, Bucket>();

// Cleanup periodico pra nao crescer infinitamente
let lastCleanup = Date.now();
function maybeCleanup(now: number) {
  if (now - lastCleanup < 5 * 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of store.entries()) {
    // Remove buckets sem hits recentes (>1h)
    if (bucket.hits.length === 0 || now - bucket.hits[bucket.hits.length - 1] > 60 * 60_000) {
      store.delete(key);
    }
  }
}

export type RateLimitOpts = {
  windowMs: number;
  max: number;
};

export function rateLimit(scope: string, key: string, opts: RateLimitOpts): boolean {
  const now = Date.now();
  maybeCleanup(now);

  const fullKey = `${scope}:${key}`;
  const bucket = store.get(fullKey) ?? { hits: [] };
  const cutoff = now - opts.windowMs;

  // Remove hits antigos
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= opts.max) {
    store.set(fullKey, bucket);
    return false; // rate limited
  }

  bucket.hits.push(now);
  store.set(fullKey, bucket);
  return true;
}

// Extrai IP de NextRequest (headers padrao Railway/Vercel/Cloudflare)
export function getIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "unknown"
  );
}
