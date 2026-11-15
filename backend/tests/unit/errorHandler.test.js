require('../helpers/env');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { errorHandler } = require('../../src/middleware/error.middleware');
const AppError = require('../../src/utils/AppError');

const run = (err) => {
    const res = { statusCode: null, body: null };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    errorHandler(err, { method: 'GET', originalUrl: '/x' }, res, () => {});
    return res;
};

test('AppError keeps its status code, message and field errors', () => {
    const res = run(new AppError('Validation failed', 400, { email: 'bad' }));
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body.errors, { email: 'bad' });
    assert.equal(res.body.success, false);
});

test('Mongo duplicate key (11000) -> 409 naming the field', () => {
    const res = run(Object.assign(new Error('dup'), { code: 11000, keyPattern: { email: 1 } }));
    assert.equal(res.statusCode, 409);
    assert.match(res.body.message, /email/);
});

test('Mongoose CastError -> 400 Invalid <path>', () => {
    const res = run(Object.assign(new Error('cast'), { name: 'CastError', path: '_id' }));
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Invalid _id');
});

test('expired JWT -> 401 with TOKEN_EXPIRED code', () => {
    const res = run(Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' }));
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.code, 'TOKEN_EXPIRED');
});

test('unknown errors become 500', () => {
    const res = run(new Error('boom'));
    assert.equal(res.statusCode, 500);
});