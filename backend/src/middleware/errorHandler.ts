import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
  errors?: any;
}

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return { message, statusCode: 400 };
};

const handleDuplicateFieldsDB = (err: any) => {
  const errmsg = err.errmsg || err.message || '';
  const match = errmsg.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return { message, statusCode: 400 };
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return { message, statusCode: 400 };
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error for debugging purposes
  console.error('ERROR 💥', err);

  if (err.name === 'CastError') error = handleCastErrorDB(error);
  if (err.code === 11000) error = handleDuplicateFieldsDB(error);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  error.message = error.message || 'Internal Server Error';

  // For both operational and non-operational, we'll send a consistent JSON structure
  // In production, we'd be more careful with non-operational errors
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error.message, // Duplicate for frontend compatibility
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;
