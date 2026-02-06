const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body
    });
  }

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let errors = err.errors;

  // Handle Prisma errors
  if (err.code === 'P2002') { // Unique constraint violation
    statusCode = 400;
    message = 'A user with this email already exists';
    errors = [{ field: 'email', message }];
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send response
  res.status(statusCode).json({
    status: 'fail',
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;