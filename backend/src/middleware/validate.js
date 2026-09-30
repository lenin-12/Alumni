const AppError = require('../utils/AppError');

const formatZodErrors = (zodError) => {
    const errors = {};
    for (const issue of zodError.issues) {
        const path = issue.path.length ? issue.path.join('.') : '_root';
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }
    return errors;
};

/**
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        return next(new AppError('Validation failed', 400, formatZodErrors(result.error)));
    }
    req[source] = result.data;
    next();
};

module.exports = validate;
