const slidingWindowRateLimiter = ({ windowMs, limit, keyGenerator }) => {
    const store = new Map();

    return (req, res, next) => {
        const key = keyGenerator ? keyGenerator(req) : req.ip;
        const now = Date.now();

        if (!store.has(key)) {
            store.set(key, []);
        }

        let timestamps = store.get(key);
        
        // Filter out timestamps older than the current window
        const windowStart = now - windowMs;
        timestamps = timestamps.filter(ts => ts > windowStart);

        if (timestamps.length >= limit) {
            res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
            return res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
        }

        timestamps.push(now);
        store.set(key, timestamps);
        next();
    };
};

module.exports = { slidingWindowRateLimiter };
