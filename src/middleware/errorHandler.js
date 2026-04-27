/**
 * Centralized Error Handling Middleware
 */

const { logger } = require('./requestLogger');

class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class AIServiceError extends AppError {
  constructor(message = 'AI service unavailable') {
    super(message, 503, 'AI_SERVICE_ERROR');
  }
}

const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File too large. Maximum size is 5MB.';
    else if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file field. Use field name "image".';
    else message = `File upload error: ${err.message}`;
  }

  if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  if (err.name === 'PayloadTooLargeError') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body too large. Maximum is 10MB.';
  }

  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    code,
    message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    requestId: req.id,
  };

  if (statusCode >= 500) console.error('🔴 SERVER ERROR:', errorLog);
  else console.warn('🟡 CLIENT ERROR:', errorLog);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 && { stack: err.stack }),
    },
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  AIServiceError,
};
