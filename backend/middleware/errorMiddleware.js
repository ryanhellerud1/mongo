const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Log the error for debugging (optional, but good for development)
  // console.error(err);

  // Mongoose CastError (bad ObjectId) - kept for reference, might be removed if no Mongoose left
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (Invalid ID format)';
  }

  // Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    // Combine messages from all validation errors
    message = err.errors.map(e => e.message).join(', ');
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400; // Or 409 Conflict
    message = err.errors.map(e => `${e.path} '${e.value}' already exists.`).join(', ');
     // Example: "email 'test@example.com' already exists."
     // Could be made more generic: "A record with this value already exists."
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400; // Or 409 Conflict
    // The specific field causing the error might be in err.fields or err.index
    // For example: "Cannot add or update record: a related record is missing."
    message = `Invalid operation: related data constraint failed. Field: ${err.fields ? err.fields.join(', ') : 'N/A'}`;
  }

  // Sequelize Database Error (more generic)
  // This might catch issues like column not found, table not found if not caught by other specific errors
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500; // Internal server error, but could be 400 if it's due to bad input not caught by validation
    message = `Database error: ${err.message}`; // Could be too verbose for production
    // For production, a generic message might be better: "A database error occurred."
  }

  // General error for JWT authentication
  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or missing token. Please authenticate.';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack, // '🥞' or null for prod
  });
};

export { notFound, errorHandler }; 