require('../helpers/env');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { connectTestDb, disconnectTestDb } = require('../helpers/db');
const { startServer, stopServer, makeClient } = require('../helpers/server');
const User = require('../../src/models/User');
const { generateAccessToken } = require('../../src/utils/generateTokens');

const mkUser = (email, role) => User.create({ name: 'T', lastName: 'U', email, password: 'x', role });

test('role-based access control against a real MongoDB', async (t) => {
    const db = await connectTestDb('rbac');
    if (db.skipReason) return t.skip(db.skipReason);

    const { server, baseUrl } = await startServer();
    const api = makeClient(baseUrl);

    try {
        const admin = await mkUser('admin@example.com', 'ADMIN');
        const alumni = await mkUser('alumni@example.com', 'ALUMNI');
        const adminToken = generateAccessToken(admin.id);
        const alumniToken = generateAccessToken(alumni.id);

        await t.test('non-admin -> 403 on GET /api/users/admin/allUsers', async () => {
            const res = await api('/api/users/admin/allUsers', { token: alumniToken });
            assert.equal(res.status, 403);
        });

        await t.test('admin -> 200 on GET /api/users/admin/allUsers and passwords are not leaked', async () => {
            const res = await api('/api/users/admin/allUsers', { token: adminToken });
            assert.equal(res.status, 200);
            assert.ok(JSON.stringify(res.body).includes('alumni@example.com'));
            assert.ok(!JSON.stringify(res.body).includes('"password"'));
        });

        await t.test('non-admin cannot promote anyone (403) and the role is unchanged', async () => {
            const res = await api(`/api/users/${alumni.id}/promote`, { method: 'PATCH', token: alumniToken });
            assert.equal(res.status, 403);
            assert.equal((await User.findById(alumni.id)).role, 'ALUMNI');
        });

        await t.test('admin can promote a user to ADMIN', async () => {
            const res = await api(`/api/users/${alumni.id}/promote`, { method: 'PATCH', token: adminToken });
            assert.equal(res.status, 200);
            assert.equal((await User.findById(alumni.id)).role, 'ADMIN');
        });

        await t.test('admin can demote another admin, but the LAST admin cannot be demoted', async () => {
            const ok = await api(`/api/users/${alumni.id}/demote`, { method: 'PATCH', token: adminToken });
            assert.equal(ok.status, 200);
            assert.equal((await User.findById(alumni.id)).role, 'ALUMNI');

            const last = await api(`/api/users/${admin.id}/demote`, { method: 'PATCH', token: adminToken });
            assert.equal(last.status, 400);
            assert.equal((await User.findById(admin.id)).role, 'ADMIN');
        });

        await t.test('valid token for a deleted user -> 401 "User no longer exists"', async () => {
            const ghost = await mkUser('ghost@example.com', 'ALUMNI');
            const ghostToken = generateAccessToken(ghost.id);
            await User.deleteOne({ _id: ghost._id });
            const res = await api('/api/auth/me', { token: ghostToken });
            assert.equal(res.status, 401);
            assert.match(res.body.message, /no longer exists/i);
        });
    } finally {
        await stopServer(server);
        await disconnectTestDb();
    }
});