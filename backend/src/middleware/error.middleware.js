const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors;
    let code = err.code;

    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = 'Validation failed';
        errors = {};
        for (const field of Object.keys(err.errors)) {
            errors[field] = err.errors[field].message;
        }
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path || 'id'}`;
    } else if (err.code === 11000) {
        statusCode = 409;
        const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
        message = `Duplicate value for ${field}`;
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Access token expired';
        code = 'TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Not authorized, token invalid';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
        message = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large. Maximum size allowed is 5MB.';
        }
    } else if (err.message && err.message.includes('Only image files are allowed')) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && statusCode >= 500) {
        message = 'Internal Server Error';
        errors = undefined;
    }

    console.error(
        `[${req.method}] ${req.originalUrl} -> ${statusCode}:`,
        err.stack || err.message
    );

    const body = {
        success: false,
        message,
    };

    if (errors && Object.keys(errors).length > 0) {
        body.errors = errors;
    }
    if (code) {
        body.code = code;
    }
    if (!isProduction && err.stack && statusCode >= 500) {
        body.stack = err.stack;
    }

    res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
