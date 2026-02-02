import { Request, Response, NextFunction } from 'express';
import Reservation from '../models/Reservation';
import * as factory from '../utils/controllerFactory';
import { AuthRequest } from '../middleware/auth';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllReservations = factory.getAll(Reservation);
export const getReservation = factory.getOne(Reservation);

export const createReservation = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Automatically set created_by and company_id
  const requestBody = {
    ...req.body,
    created_by: req.user?._id || req.user?.id,
  };

  if (req.user && req.user.company_id) {
    requestBody.company_id = req.user.company_id;
  }

  if (!requestBody.company_id && requestBody.branch_id) {
    const Branch = (await import('../models/Branch')).default;
    const branch = await Branch.findById(requestBody.branch_id);
    if (branch) {
      requestBody.company_id = branch.company_id;
    }
  }

  // Auto-set branch_id for manager/staff/cashier if not provided
  if (req.user && ['manager', 'staff', 'cashier'].includes(req.user.role)) {
    if (!requestBody.branch_id && req.user.branch_id) {
      requestBody.branch_id = req.user.branch_id;
    }
  }

  const reservation = await Reservation.create(requestBody);
  const transformedDoc = { ...reservation.toObject(), id: reservation._id.toString() };

  // Emit socket event for new reservation
  const io = req.app.get('io');
  if (io) {
    io.to('manager-reservations').emit('new-reservation', transformedDoc);
  }

  res.status(201).json(transformedDoc);
});

export const updateReservation = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return next(new AppError('Document not found', 404));
  }

  // Tenant security check
  if (req.user && req.user.role !== 'customer' && reservation.company_id) {
    if (reservation.company_id.toString() !== req.user.company_id?.toString()) {
      return next(new AppError('You do not have permission to update this document', 403));
    }
  }

  // Branch security check
  if (req.user && ['manager', 'staff', 'cashier'].includes(req.user.role)) {
    if (reservation.branch_id?.toString() !== req.user.branch_id?.toString()) {
      return next(new Error('You do not have permission to update this document'));
    }
  }

  const previousStatus = reservation.status;
  reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!reservation) {
    return next(new AppError('Document not found after update', 404));
  }

  const transformedDoc = { ...reservation.toObject(), id: reservation._id.toString() };

  // Emit socket event for reservation status update
  const io = req.app.get('io');
  if (io && req.body.status && req.body.status !== previousStatus) {
    io.to('manager-reservations').emit('reservation-status-update', {
      reservationId: transformedDoc.id,
      status: transformedDoc.status,
    });
  }

  res.status(200).json(transformedDoc);
});

export const deleteReservation = factory.deleteOne(Reservation);
