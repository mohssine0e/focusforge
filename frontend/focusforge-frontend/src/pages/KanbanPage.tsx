import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import type { Task, TaskStatusType } from '../types';

const statusClass: Record<string, string> = {
  TODO: 'bg-slate-400/10 text-slate-200',
  IN_PROGRESS: 'bg-blue-400/10 text-blue-200',
  BLOCKED: 'bg-red-400/10 text-red-200',
  REVIEW: 'bg-violet-400/10 text-violet-200',
  DONE: 'bg-emerald-400/10 text-emerald-200',
};

const priorityClass: Record<string, string> = {
  LOW: 'bg-slate-400/10 text-slate-200',
  MEDIUM: 'bg-cyan-400/10 text-cyan-200',
  HIGH: 'bg-amber-400/10 text-amber-200',
  URGENT: 'bg-red-400/10 text-red-200',
};

// Define valid state transitions based on the State pattern rules
const getValidTransitions = (currentStatus: TaskStatusType): TaskStatusType[] => {
  switch (currentStatus) {
    case 'TODO':
      return ['IN_PROGRESS', 'BLOCKED'];
    case 'IN_PROGRESS':
      return ['REVIEW', 'BLOCKED'];
    case 'BLOCKED':
      return ['IN_PROGRESS'];
    case 'REVIEW':
      return ['DONE'];
    case 'DONE':
      return []; // No transitions allowed from DONE state
    default:
      return [];
  }
};

const KanbanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      if (id) {
        const data = await taskApi.getTasksByProject(parseInt(id));
        setTasks(data);
      }
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks, id]);

  if (loading) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-slate-300">Loading tasks...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-800 bg-red-900 p-5 text-red-200">Error: {error}</div>;
  }

  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    BLOCKED: [],
    REVIEW: [],
    DONE: []
  };

  tasks.forEach(task => {
    const status = task.status as string;
    if (!tasksByStatus[status]) {
      tasksByStatus[status] = [];
    }
    tasksByStatus[status].push(task);
  });

  const updateTaskStatus = async (taskId: number, newStatus: TaskStatusType) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t =>
        t.id === taskId ? updatedTask : t
      ));
    } catch (err) {
      setError('Failed to update task status');
      console.error(err);
    }
  };

  const getTransitionButtons = (task: Task) => {
    const validTransitions = getValidTransitions(task.status);

    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {validTransitions.map(transition => (
          <button
            key={transition}
            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
            onClick={() => updateTaskStatus(task.id, transition)}
          >
            {transition}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="kanban-board p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Kanban Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(tasksByStatus).map(([status, taskList]) => (
          <div key={status} className="kanban-column bg-slate-900 rounded-lg border border-slate-800 p-4">
            <h2 className="text-xl font-semibold text-white mb-4 capitalize">
              {status.replace('_', ' ')}
            </h2>
            <div className="space-y-3 min-h-[100px]">
              {taskList.map(task => (
                <div key={task.id} className="task-item rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                    <span className={`rounded-full px-2 py-1 ${statusClass[task.status] || statusClass.TODO}`}>
                      {task.status}
                    </span>
                    <span className={`rounded-full px-2 py-1 ${priorityClass[task.priority] || priorityClass.MEDIUM}`}>
                      {task.priorityLabel ?? task.priority}
                    </span>
                    <span className="rounded-full bg-fuchsia-400/10 px-2 py-1 text-fuchsia-200">
                      {task.type}
                    </span>
                  </div>
                  {(task.overdue || task.dueSoon || task.dependencyWarning) && (
                    <div className="mt-3 space-y-2 text-xs">
                      {task.overdue && (
                        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-100">
                          Overdue
                        </p>
                      )}
                      {task.dueSoon && (
                        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-100">
                          Due soon
                        </p>
                      )}
                      {task.dependencyWarning && (
                        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-100">
                          {task.blockedReason ?? 'Blocked by dependencies'}
                        </p>
                      )}
                    </div>
                  )}
                  {getTransitionButtons(task)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanPage;
