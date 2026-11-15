require('../helpers/env');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { connectTestDb, disconnectTestDb } = require('../helpers/db');
const { startServer, stopServer, makeClient } = require('../helpers/server');
const User = require('../../src/models/User');
const JobOpportunity = require('../../src/models/JobOpportunity');
const { generateAccessToken } = require('../../src/utils/generateTokens');

const mkUser = (email, role) => User.create({ name: 'T', lastName: 'U', email, password: 'x', role });
const job = { title: 'SDE Intern', company: 'Acme', location: 'Remote', description: 'Build things' };

// Regression coverage: controllers compare ids using `req.user.id`, so the auth middleware
// must always provide it (it used to be missing when the user came from a lean/cached query).
test('resource ownership checks against a real MongoDB', async (t) => {
    const db = await connectTestDb('ownership');
    if (db.skipReason) return t.skip(db.skipReason);

    const { server, baseUrl } = await startServer();
    const api = makeClient(baseUrl);

    try {
        const owner = await mkUser('owner@example.com', 'ALUMNI');
        const other = await mkUser('other@example.com', 'ALUMNI');
        const admin = await mkUser('admin@example.com', 'ADMIN');
        const ownerToken = generateAccessToken(owner.id);
        const otherToken = generateAccessToken(other.id);
        const adminToken = generateAccessToken(admin.id);
        let jobId;

        await t.test('authenticated user can post a job and becomes its owner', async () => {
            const res = await api('/api/jobs', { method: 'POST', token: ownerToken, body: job });
            assert.equal(res.status, 201);
            jobId = res.body.id;
            assert.equal(String((await JobOpportunity.findById(jobId)).postedBy), owner.id);
        });

        await t.test("another non-admin cannot delete someone else's job (403)", async () => {
            const res = await api(`/api/jobs/${jobId}`, { method: 'DELETE', token: otherToken });
            assert.equal(res.status, 403);
            assert.ok(await JobOpportunity.findById(jobId));
        });

        await t.test('the owner can delete their own job', async () => {
            const res = await api(`/api/jobs/${jobId}`, { method: 'DELETE', token: ownerToken });
            assert.equal(res.status, 200);
            assert.equal(await JobOpportunity.findById(jobId), null);
        });

        await t.test('an admin can delete any job', async () => {
            const created = await api('/api/jobs', { method: 'POST', token: ownerToken, body: job });
            const res = await api(`/api/jobs/${created.body.id}`, { method: 'DELETE', token: adminToken });
            assert.equal(res.status, 200);
        });

        await t.test('GET /api/chat/recent/:userId works for yourself, 403 for someone else', async () => {
            const mine = await api(`/api/chat/recent/${owner.id}`, { token: ownerToken });
            assert.equal(mine.status, 200);
            const theirs = await api(`/api/chat/recent/${owner.id}`, { token: otherToken });
            assert.equal(theirs.status, 403);
        });
    } finally {
        await stopServer(server);
        await disconnectTestDb();
    }
});