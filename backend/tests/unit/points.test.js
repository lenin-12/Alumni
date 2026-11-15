require('../helpers/env');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const UserPoints = require('../../src/models/UserPoints');
const { awardPoints, deductPoints } = require('../../src/utils/points');

// These mock the model, so no database is needed.

test('awardPoints adds to an existing balance and saves', async (t) => {
    const doc = { points: 10, saved: false, async save() { this.saved = true; } };
    t.mock.method(UserPoints, 'findOne', async () => doc);
    await awardPoints('u1', 5);
    assert.equal(doc.points, 15);
    assert.equal(doc.saved, true);
});

test('awardPoints creates a record for a user with no points yet', async (t) => {
    t.mock.method(UserPoints, 'findOne', async () => null);
    const create = t.mock.method(UserPoints, 'create', async () => ({}));
    await awardPoints('u2', 20);
    assert.equal(create.mock.callCount(), 1);
    assert.deepEqual(create.mock.calls[0].arguments[0], { userId: 'u2', points: 20 });
});

test('deductPoints never lets the balance go below zero', async (t) => {
    const doc = { points: 5, async save() {} };
    t.mock.method(UserPoints, 'findOne', async () => doc);
    await deductPoints('u3', 50);
    assert.equal(doc.points, 0);
});

test('awardPoints does not throw when the database fails (errors are logged)', async (t) => {
    t.mock.method(UserPoints, 'findOne', async () => { throw new Error('db down'); });
    t.mock.method(console, 'error', () => {});
    await assert.doesNotReject(awardPoints('u4', 1));
});