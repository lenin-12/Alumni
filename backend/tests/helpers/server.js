require('./env');
const http = require('http');
const app = require('../../src/app');

const startServer = () =>
    new Promise((resolve) => {
        const server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
            resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
        });
    });

const stopServer = (server) => new Promise((resolve) => server.close(resolve));

/** Tiny fetch wrapper: returns { status, body, headers } and parses JSON when present. */
const makeClient = (baseUrl) => async (path, { method = 'GET', token, body, headers = {} } = {}) => {
    const finalHeaders = { ...headers };
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
    if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';

    const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: finalHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: res.status, body: json, headers: res.headers };
};

module.exports = { startServer, stopServer, makeClient };