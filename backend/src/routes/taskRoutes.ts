import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;
