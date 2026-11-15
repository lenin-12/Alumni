const Redis = require('ioredis');

let client = null;
let isReady = false;

const createRedisClient = () => {
    const url = process.env.REDIS_URL;

    if (!url) {
        console.log('[Redis] REDIS_URL not set — caching disabled, app continues normally.');
        return null;
    }

    const redis = new Redis(url, {
        connectTimeout: 2000,
        commandTimeout: 1000,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
            if (times > 5) {
                return null;
            }
            return Math.min(times * 300, 3000);
        },
        tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });

    redis.on('connect', () => {
        isReady = true;
        console.log('[Redis] Connected.');
    });

    redis.on('ready', () => {
        isReady = true;
    });

    redis.on('error', (err) => {
        isReady = false;
        console.error('[Redis] Error (non-fatal):', err.message);
    });

    redis.on('close', () => {
        isReady = false;
    });

    redis.on('reconnecting', () => {
        isReady = false;
    });

    return redis;
};

client = createRedisClient();

const getClient = () => client;
const getIsReady = () => isReady;

const closeRedis = async () => {
    if (client) {
        await client.quit();
        isReady = false;
    }
};

module.exports = { getClient, getIsReady, closeRedis };
