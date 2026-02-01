import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log the error for debugging purposes
  console.error('ERROR 💥', err);

  // For operational errors, we can send a more specific message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  } else {
    // For programming or other unknown errors, we don't want to leak error details
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export default errorHandler;
