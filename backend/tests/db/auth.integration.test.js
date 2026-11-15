require('../helpers/env');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectTestDb, disconnectTestDb } = require('../helpers/db');
const { startServer, stopServer, makeClient } = require('../helpers/server');
const User = require('../../src/models/User');

// /register and /login share a 5-request rate limiter per process: this file makes exactly 5.
const user = { name: 'Asha', lastName: 'Verma', email: 'asha@example.com', password: 'Passw0rd!' };

test('auth flow against a real MongoDB', async (t) => {
    const db = await connectTestDb('auth');
    if (db.skipReason) return t.skip(db.skipReason);
    await User.init(); // build the unique email index before the first insert

    const { server, baseUrl } = await startServer();
    const api = makeClient(baseUrl);
    let token;

    try {
        await t.test('register -> 201, default role ALUMNI, password stored hashed', async () => {
            const res = await api('/api/auth/register', { method: 'POST', body: user });
            assert.equal(res.status, 201);
            assert.equal(res.body.role, 'ALUMNI');
            assert.equal(typeof res.body.token, 'string');
            assert.equal(res.body.password, undefined);

            const stored = await User.findOne({ email: user.email });
            assert.notEqual(stored.password, user.password);
            assert.match(stored.password, /^\$2[aby]\$/); // bcrypt hash
        });

        await t.test('registering the same email again -> 400 and no duplicate row', async () => {
            const res = await api('/api/auth/register', { method: 'POST', body: user });
            assert.equal(res.status, 400);
            assert.match(res.body.message, /already exists/i);
            assert.equal(await User.countDocuments({ email: user.email }), 1);
        });

        await t.test('login with correct password -> 200, token and httpOnly refresh cookie', async () => {
            const res = await api('/api/auth/login', { method: 'POST', body: { email: user.email, password: user.password } });
            assert.equal(res.status, 200);
            token = res.body.token;
            assert.equal(typeof token, 'string');
            const cookie = res.headers.get('set-cookie') || '';
            assert.match(cookie, /refreshToken=/);
            assert.match(cookie, /HttpOnly/i);
        });

        await t.test('login with a wrong password -> 401 Invalid credentials', async () => {
            const res = await api('/api/auth/login', { method: 'POST', body: { email: user.email, password: 'wrong' } });
            assert.equal(res.status, 401);
            assert.equal(res.body.message, 'Invalid credentials');
        });

        await t.test('GET /api/auth/me with a valid token returns the logged-in user', async () => {
            const res = await api('/api/auth/me', { token });
            assert.equal(res.status, 200);
            assert.equal(res.body.user?.email, user.email);
            assert.equal(res.body.user?.password, undefined);
        });
    } finally {
        await stopServer(server);
        await disconnectTestDb();
    }
});