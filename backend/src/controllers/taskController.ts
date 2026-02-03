import Task from '../models/Task';
import * as factory from '../utils/controllerFactory';

export const getAllTasks = factory.getAll(Task);
export const getTask = factory.getOne(Task);
export const createTask = factory.createOne(Task);
export const updateTask = factory.updateOne(Task);
export const deleteTask = factory.deleteOne(Task);
