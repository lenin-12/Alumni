require('../helpers/env');
const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const { slidingWindowRateLimiter } = require('../../src/middleware/rateLimiter.middleware');

const makeRes = () => {
    const res = { headers: {}, statusCode: 200, body: null };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    return res;
};

// Runs the middleware once and reports whether it called next().
const hit = (limiter, ip) => {
    const res = makeRes();
    let passed = false;
    limiter({ ip }, res, () => { passed = true; });
    return { passed, res };
};

test('allows up to `limit` requests, then answers 429 with Retry-After', () => {
    const limiter = slidingWindowRateLimiter({ windowMs: 60_000, limit: 3 });
    for (let i = 0; i < 3; i++) assert.equal(hit(limiter, '1.1.1.1').passed, true);

    const blocked = hit(limiter, '1.1.1.1');
    assert.equal(blocked.passed, false);
    assert.equal(blocked.res.statusCode, 429);
    assert.equal(blocked.res.headers['Retry-After'], 60);
});

test('limits are tracked per key (different IPs do not affect each other)', () => {
    const limiter = slidingWindowRateLimiter({ windowMs: 60_000, limit: 1 });
    assert.equal(hit(limiter, 'a').passed, true);
    assert.equal(hit(limiter, 'a').passed, false);
    assert.equal(hit(limiter, 'b').passed, true);
});

test('the window slides: requests are allowed again after windowMs', (t) => {
    let now = 1_000_000;
    t.mock.method(Date, 'now', () => now);
    const limiter = slidingWindowRateLimiter({ windowMs: 1000, limit: 1 });

    assert.equal(hit(limiter, 'x').passed, true);
    assert.equal(hit(limiter, 'x').passed, false);
    now += 1001;
    assert.equal(hit(limiter, 'x').passed, true);
});

test('a custom keyGenerator is used', () => {
    const limiter = slidingWindowRateLimiter({ windowMs: 60_000, limit: 1, keyGenerator: (req) => req.userId });
    const call = (userId) => {
        let passed = false;
        limiter({ ip: 'same', userId }, makeRes(), () => { passed = true; });
        return passed;
    };
    assert.equal(call('u1'), true);
    assert.equal(call('u2'), true);
    assert.equal(call('u1'), false);
});