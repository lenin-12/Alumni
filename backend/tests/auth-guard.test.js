require('./helpers/env');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { startServer, stopServer, makeClient } = require('./helpers/server');

let ctx, api;
before(async () => { ctx = await startServer(); api = makeClient(ctx.baseUrl); });
after(() => stopServer(ctx.server));

// Every route here uses the `protect` middleware, which rejects before touching the database.
const protectedRoutes = [
    ['GET', '/api/auth/me'],
    ['GET', '/api/users/leaderboard'],
    ['GET', '/api/users/admin/allUsers'],
    ['PATCH', '/api/users/507f1f77bcf86cd799439011/promote'],
    ['GET', '/api/contact/all'],
];

for (const [method, path] of protectedRoutes) {
    test(`${method} ${path} -> 401 without a token`, async () => {
        const res = await api(path, { method });
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /no token/i);
    });
}

test('garbage token -> 401 token invalid', async () => {
    const res = await api('/api/auth/me', { token: 'not-a-real-jwt' });
    assert.equal(res.status, 401);
    assert.match(res.body.message, /token invalid/i);
});

test('token signed with the wrong secret -> 401', async () => {
    const forged = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'some-other-secret');
    const res = await api('/api/auth/me', { token: forged });
    assert.equal(res.status, 401);
});

test('expired token -> 401 with code TOKEN_EXPIRED (frontend uses it to refresh)', async () => {
    const expired = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_ACCESS_SECRET, { expiresIn: -10 });
    const res = await api('/api/auth/me', { token: expired });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'TOKEN_EXPIRED');
});

test('Authorization header without "Bearer " is treated as no token', async () => {
    const res = await api('/api/auth/me', { headers: { Authorization: 'Token abc' } });
    assert.equal(res.status, 401);
    assert.match(res.body.message, /no token/i);
});