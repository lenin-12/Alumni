# Alumni Network Backend — Redis Caching Guide

## Setup

Add to your `.env` (see `.env.example`):

```
REDIS_URL=rediss://:your_password@your-host:6380
REDIS_PREFIX=alumni:prod:
```

If `REDIS_URL` is not set the app runs normally with caching disabled — **no crash, no change in behavior**.

## What is cached

| Resource | TTL | Key pattern |
|---|---|---|
| Leaderboard (top N) | 60 s | `<prefix>leaderboard:v<ver>:n<limit>` |
| Alumni list (paginated) | 120 s | `<prefix>alumni:v<ver>:p<page>:l<limit>` |
| Alumni search results | 120 s | `<prefix>search:v<ver>:t<type>:q<query>:p<page>:l<limit>` |
| Jobs list | 120 s | `<prefix>jobs:v<ver>:p<page>:l<limit>` |
| Events list | 300 s | `<prefix>events:v<ver>:p<page>:l<limit>` |
| Gallery images by folder | 300 s | `<prefix>gallery:v<ver>:<folder>:p<page>:l<limit>` |
| Achievements list | 120 s | `<prefix>achievements:v<ver>:p<page>:l<limit>` |
| User points | 60 s | `<prefix>points:<userId>` |
| User lookup (auth guard) | 60 s | `<prefix>user:<userId>` |

## What is NOT cached

- Chat messages, connections (real-time)
- Auth / refresh endpoints
- Write operations (POST, PUT, DELETE)

## Cache design

- **Versioned namespaces**: list resources store a version counter (e.g. `ver:jobs`). Invalidating = `INCR ver:jobs` (O(1), no KEYS scan). Cached keys embed the version so stale pages are naturally orphaned and expired by TTL.
- **Entity keys**: `user:<id>` and `points:<id>` are deleted with `DEL` on write.
- **TTL jitter ±10%**: prevents thundering herds at mass expiry.
- **Single-flight**: concurrent requests for the same cache miss share one DB fetch (per-process).
- **Fail-open**: any Redis error (timeout, disconnection) falls through to MongoDB — the request always succeeds.

## Recommended Redis server settings

```
maxmemory 256mb
maxmemory-policy allkeys-lru   # evict least-recently-used keys when full
requirepass <strong-password>
# No public port — bind to private network only
# Persistence not needed for a pure cache layer
```

## Monitoring

```
GET /health/cache
```

Returns:
```json
{
  "redis": { "enabled": true, "connected": true },
  "metrics": { "hits": 123, "misses": 45, "hitRate": 73 }
}
```

## Distributed stampede protection

The single-flight deduplication is **per-process**. With multiple Node.js instances you would need a distributed lock (Redis `SET NX PX`) to fully eliminate redundant DB fetches on a cold cache miss. This is the natural next step when scaling horizontally.
