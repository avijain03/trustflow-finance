// Purpose: Zod validation middleware factory — wraps route handlers with schema validation
'use strict';

/**
 * validate — Returns Express middleware that validates req.body against a Zod schema.
 * On failure, returns 400 with field-level error messages.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        fields[key] = issue.message;
      }
      return res.status(400).json({
        success: false,
        error:   'VALIDATION_ERROR',
        fields,
      });
    }

    req.body = result.data; // Replace with parsed + coerced data
    next();
  };
}

module.exports = { validate };
