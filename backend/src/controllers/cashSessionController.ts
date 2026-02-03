import CashSession from '../models/CashSession';
import * as factory from '../utils/controllerFactory';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export const getAllCashSessions = factory.getAll(CashSession);
export const getCashSession = factory.getOne(CashSession);
export const createCashSession = factory.createOne(CashSession);
export const updateCashSession = factory.updateOne(CashSession);

/**
 * Close Cash Session
 */
export const closeCashSession = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { closing_balance, notes } = req.body;
  const session = await CashSession.findById(req.params.id);

  if (!session) {
    return next(new AppError('Session not found', 404));
  }

  if (session.status === 'closed') {
    return next(new AppError('Session already closed', 400));
  }

  session.closing_balance = closing_balance;
  session.status = 'closed';
  session.closed_at = new Date();
  session.notes = notes;

  // Calculate difference if expected_balance is set
  if (session.expected_balance !== undefined) {
    session.difference = closing_balance - session.expected_balance;
  }

  await session.save();

  res.status(200).json(session);
});
