
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.REDIS_URL = '';


const originalError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && /^\[(GET|POST|PUT|PATCH|DELETE)\] /.test(args[0])) return;
    originalError(...args);
};