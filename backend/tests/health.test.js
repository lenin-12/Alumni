require('./helpers/env');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, makeClient } = require('./helpers/server');

let ctx, api;
before(async () => { ctx = await startServer(); api = makeClient(ctx.baseUrl); });
after(() => stopServer(ctx.server));

test('GET /health is a liveness check that always answers 200', async () => {
    const res = await api('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(typeof res.body.uptime, 'number');
});

test('GET /health/ready returns 503 while MongoDB is not connected', async () => {
    const res = await api('/health/ready');
    assert.equal(res.status, 503);
    assert.equal(res.body.status, 'not_ready');
    assert.equal(res.body.checks.mongo, 'down');
    assert.equal(res.body.checks.redis, 'disabled'); // optional dependency, reported not required
});

test('GET /health/cache still works and reports Redis disabled', async () => {
    const res = await api('/health/cache');
    assert.equal(res.status, 200);
    assert.equal(res.body.redis.enabled, false);
});

test('GET / returns the welcome message', async () => {
    const res = await api('/');
    assert.equal(res.status, 200);
    assert.match(res.body.message, /Alumni Network API/);
});

test('unknown route returns the standard 404 error shape', async () => {
    const res = await api('/api/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Route not found/);
});