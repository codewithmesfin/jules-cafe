import Shift from '../models/Shift';
import * as factory from '../utils/controllerFactory';
import catchAsync from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';

export const getAllShifts = factory.getAll(Shift);
export const getShift = factory.getOne(Shift);

/**
 * Clock In
 */
export const clockIn = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user.default_business_id;
  const userId = req.user._id;

  // Check if already clocked in
  const existingShift = await Shift.findOne({
    user_id: userId,
    status: 'active'
  });

  if (existingShift) {
    return next(new AppError('You are already clocked in', 400));
  }

  const shift = await Shift.create({
    business_id: businessId,
    user_id: userId,
    clock_in: new Date(),
    status: 'active'
  });

  res.status(201).json(shift);
});

/**
 * Clock Out
 */
export const clockOut = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  const shift = await Shift.findOne({
    user_id: userId,
    status: 'active'
  });

  if (!shift) {
    return next(new AppError('No active shift found', 404));
  }

  shift.clock_out = new Date();
  shift.status = 'completed';

  // Calculate duration
  const durationMs = shift.clock_out.getTime() - shift.clock_in.getTime();
  shift.duration_minutes = Math.round(durationMs / 60000);

  await shift.save();

  res.status(200).json(shift);
});
