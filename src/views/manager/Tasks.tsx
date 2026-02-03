"use client";
import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Task } from '../../types';

const Tasks: React.FC = () => {
  const { showNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.tasks.getAll();
      setTasks(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await api.tasks.create({
        title: newTaskTitle,
        status: 'pending',
        priority: 'medium'
      });
      setNewTaskTitle('');
      fetchTasks();
      showNotification('Task added to your list');
    } catch (error) {
      showNotification('Failed to create task', 'error');
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.tasks.update((task.id || task._id)!, { status: newStatus });
      fetchTasks();
    } catch (error) {
      showNotification('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.tasks.delete(id);
      fetchTasks();
      showNotification('Task deleted', 'warning');
    } catch (error) {
      showNotification('Failed to delete task', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Tasks</h1>
        <p className="text-slate-500 font-medium">Keep your restaurant operations organized and on track</p>
      </div>

      <form onSubmit={handleCreateTask} className="flex gap-4">
        <input
          type="text"
          placeholder="What needs to be done? (e.g. Prep morning vegetables)"
          className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <Button type="submit" className="rounded-2xl px-8 h-14 font-black shadow-lg shadow-blue-100">
          <Plus size={20} className="mr-2" /> Add Task
        </Button>
      </form>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white animate-pulse rounded-2xl border border-slate-100" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <CheckCircle2 className="mx-auto h-12 w-12 text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">Your task list is empty. Take a break!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <Card
              key={task.id || task._id}
              className={cn(
                "p-4 rounded-2xl border-slate-100 flex items-center gap-4 hover:shadow-md transition-all group",
                task.status === 'completed' ? "bg-slate-50 opacity-60" : "bg-white"
              )}
            >
              <button
                onClick={() => handleToggleTask(task)}
                className={cn(
                  "shrink-0 transition-colors",
                  task.status === 'completed' ? "text-green-500" : "text-slate-300 hover:text-blue-500"
                )}
              >
                {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-bold text-slate-900 truncate",
                  task.status === 'completed' && "line-through decoration-2"
                )}>
                  {task.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2",
                    task.priority === 'urgent' ? "bg-rose-50 text-rose-600 border-rose-100" :
                    task.priority === 'high' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    "bg-slate-50 text-slate-400 border-slate-100"
                  )}
                >
                  {task.priority}
                </Badge>
                <button
                  onClick={() => handleDeleteTask((task.id || task._id)!)}
                  className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
