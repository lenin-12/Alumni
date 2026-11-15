const { getClient, getIsReady } = require('../config/redis');

const PREFIX = process.env.REDIS_PREFIX || 'alumni:';


const inFlight = new Map();


let hits = 0;
let misses = 0;


const buildKey = (resource, version, params = '') => {
    const base = `${PREFIX}${resource}:v${version}`;
    return params ? `${base}:${params}` : base;
};


const entityKey = (type, id) => `${PREFIX}${type}:${id}`;

const jitterTTL = (ttlSeconds) => {
    const jitter = Math.floor(ttlSeconds * 0.1 * (Math.random() * 2 - 1));
    return ttlSeconds + jitter;
};


const safeRedis = async (fn) => {
    const client = getClient();
    if (!client || !getIsReady()) return null;
    try {
        return await fn(client);
    } catch (err) {
        console.error('[Cache] Redis error (non-fatal):', err.message);
        return null;
    }
};


const getOrSet = async (key, ttlSeconds, fetcher) => {
   
    const cached = await safeRedis(async (client) => client.get(key));
    if (cached !== null) {
        hits++;
        return JSON.parse(cached);
    }

    misses++;

    
    if (inFlight.has(key)) {
        return inFlight.get(key);
    }

    // 3. Fetch from DB
    const fetchPromise = (async () => {
        try {
            const value = await fetcher();
            const ttl = jitterTTL(ttlSeconds);
            // Fire-and-forget the set; don't let a Redis write failure break the response
            safeRedis((client) => client.setex(key, ttl, JSON.stringify(value)));
            return value;
        } finally {
            inFlight.delete(key);
        }
    })();

    inFlight.set(key, fetchPromise);
    return fetchPromise;
};


const del = async (key) => {
    await safeRedis((client) => client.del(key));
};

const incrVersion = async (versionKey) => {
    const result = await safeRedis((client) => client.incr(versionKey));
    return result ?? 1;
};


const getVersion = async (versionKey) => {
    const result = await safeRedis((client) => client.get(versionKey));
    return result ? parseInt(result, 10) : 1;
};

const getMetrics = () => ({
    hits,
    misses,
    hitRate: hits + misses === 0 ? 0 : Math.round((hits / (hits + misses)) * 100),
});

module.exports = {
    buildKey,
    entityKey,
    getOrSet,
    del,
    incrVersion,
    getVersion,
    getMetrics,
    jitterTTL,
};
