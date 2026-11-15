require('./helpers/env');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, makeClient } = require('./helpers/server');

let ctx, api;
before(async () => { ctx = await startServer(); api = makeClient(ctx.baseUrl); });
after(() => stopServer(ctx.server));


const validUser = { name: 'Asha', lastName: 'Verma', email: 'asha@example.com', password: 'Passw0rd!' };

test('register with empty body -> 400 listing every missing field', async () => {
    const res = await api('/api/auth/register', { method: 'POST', body: {} });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, 'Validation failed');
    for (const field of ['name', 'lastName', 'email', 'password']) {
        assert.ok(res.body.errors[field], `expected an error for ${field}`);
    }
});

test('SECURITY: register cannot create an ADMIN account', async () => {
    const res = await api('/api/auth/register', { method: 'POST', body: { ...validUser, role: 'ADMIN' } });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.role, 'role must be rejected by the schema');
});

test('register with an invalid email -> 400', async () => {
    const res = await api('/api/auth/register', { method: 'POST', body: { ...validUser, email: 'nope' } });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.email);
});

test('login with empty body -> 400', async () => {
    const res = await api('/api/auth/login', { method: 'POST', body: {} });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.email);
    assert.ok(res.body.errors.password);
});

test('login with an invalid email -> 400', async () => {
    const res = await api('/api/auth/login', { method: 'POST', body: { email: 'bad', password: 'x' } });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.email);
});