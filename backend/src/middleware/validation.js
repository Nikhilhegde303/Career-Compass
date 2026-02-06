import Joi from 'joi';

// Validation schemas
const authSchemas = {
  // Register validation
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'string.empty': 'Password is required'
    })
  }),

  // Login validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Show all errors at once
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      // Format validation errors
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

export { authSchemas, validate };