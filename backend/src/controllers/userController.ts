import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import * as factory from '../utils/controllerFactory';

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const deleteUser = factory.deleteOne(User);

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password, email, ...rest } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const user = await User.create({
      ...rest,
      email,
      password: hashedPassword,
      passwordResetRequired: true // Admin created users must reset password
    });

    res.status(201).json({
      ...user.toJSON(),
      id: user._id.toString()
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const data = { ...rest };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({
      ...user.toJSON(),
      id: user._id.toString()
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
