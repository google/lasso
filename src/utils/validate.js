const Joi = require('joi');

/**
 * Validator for audit requests
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function auditRequestValidation(req, res, next) {
  const schema = Joi.object({
    urls: Joi.array().required().min(1).max(5),
    blockedRequests: Joi.array(),
  });

  validateRequest(req, res, next, schema);
}

/**
 * Validator for async audit requests
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function asyncAuditRequestValidation(req, res, next) {
  const schema = Joi.object({
    urls: Joi.array().required().min(1).max(1000),
    blockedRequests: Joi.array(),
  });

  validateRequest(req, res, next, schema);
}

/**
 * Validator for active tasks listing request
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function activeTasksRequestValidation(req, res, next) {
  const schema = Joi.object({
    pageSize: Joi.number(),
    pageToken: Joi.string(),
  });

  validateRequest(req, res, next, schema);
}

/**
 * Runs the request validation
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @param {Object} schema
 * @return {*}
 */
function validateRequest(req, res, next, schema) {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };
  const {error, value} = schema.validate(req.body, options);
  if (error) {
    const errors = error.details.map((x) => x.message).join(', ');

    res.status(500);
    return res.json({
      'error': {
        'code': 500,
        'message': errors,
      },
    });
  } else {
    req.body = value;
    next();
  }
}

module.exports = {
  auditRequestValidation,
  asyncAuditRequestValidation,
  activeTasksRequestValidation,
};
