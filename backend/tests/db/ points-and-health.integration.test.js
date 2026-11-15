require('../helpers/env');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { connectTestDb, disconnectTestDb } = require('../helpers/db');
const { startServer, stopServer, makeClient } = require('../helpers/server');
const User = require('../../src/models/User');
const UserPoints = require('../../src/models/UserPoints');
const { awardPoints, deductPoints } = require('../../src/utils/points');
const { generateAccessToken } = require('../../src/utils/generateTokens');

test('points system and readiness probe against a real MongoDB', async (t) => {
    const db = await connectTestDb('points');
    if (db.skipReason) return t.skip(db.skipReason);
    await UserPoints.init();

    const { server, baseUrl } = await startServer();
    const api = makeClient(baseUrl);

    try {
        const user = await User.create({ name: 'P', lastName: 'Q', email: 'p@example.com', password: 'x' });

        await t.test('GET /health/ready -> 200 with mongo "up" once connected', async () => {
            const res = await api('/health/ready');
            assert.equal(res.status, 200);
            assert.equal(res.body.checks.mongo, 'up');
        });

        await t.test('awardPoints creates then accumulates; one UserPoints row per user', async () => {
            await awardPoints(user.id, 10);
            await awardPoints(user.id, 15);
            const rows = await UserPoints.find({ userId: user.id });
            assert.equal(rows.length, 1);
            assert.equal(rows[0].points, 25);
        });

        await t.test('GET /api/users/:id/points returns the stored balance', async () => {
            const res = await api(`/api/users/${user.id}/points`, { token: generateAccessToken(user.id) });
            assert.equal(res.status, 200);
            assert.equal(res.body.points, 25);
        });

        await t.test('deductPoints floors at zero', async () => {
            await deductPoints(user.id, 1000);
            assert.equal((await UserPoints.findOne({ userId: user.id })).points, 0);
        });
    } finally {
        await stopServer(server);
        await disconnectTestDb();
    }
});