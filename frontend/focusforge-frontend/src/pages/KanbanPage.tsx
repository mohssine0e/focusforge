import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import type { Task, TaskStatusType } from '../types';

const statusClass: Record<string, string> = {
  TODO: 'border-[#55556a] bg-[#55556a]/15 text-[#c7c7d6]',
  IN_PROGRESS: 'border-[#7c6ef7] bg-[#7c6ef7]/15 text-[#bdb7ff]',
  BLOCKED: 'border-[#e05555] bg-[#e05555]/15 text-[#ffb7b7]',
  REVIEW: 'border-[#f0a500] bg-[#f0a500]/15 text-[#ffd27a]',
  DONE: 'border-[#22c55e] bg-[#22c55e]/15 text-[#86efac]',
};

const priorityClass: Record<string, string> = {
  LOW: 'bg-[#55556a]/20 text-[#b8b8c8]',
  MEDIUM: 'bg-[#f0a500]/20 text-[#ffd27a]',
  HIGH: 'bg-[#e07855]/20 text-[#ffb092]',
  URGENT: 'bg-[#e05555]/20 text-[#ffb7b7]',
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

const statusAccent: Record<string, string> = {
  TODO: 'bg-[#55556a]',
  IN_PROGRESS: 'bg-[#7c6ef7]',
  BLOCKED: 'bg-[#e05555]',
  REVIEW: 'bg-[#f0a500]',
  DONE: 'bg-[#22c55e]',
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
    return (
      <div className="space-y-6 p-6">
        <div className="h-9 w-56 animate-pulse rounded bg-[#22223a]" />
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl border border-[#2e2e45] bg-[#1a1a24]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">Error: {error}</div>;
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
            className="rounded-md border border-[#2e2e45] px-2 py-1 text-xs font-medium text-[#f0f0f5] hover:border-[#7c6ef7] hover:bg-[#7c6ef7]/10"
            onClick={() => updateTaskStatus(task.id, transition)}
            type="button"
          >
            {transition.replace('_', ' ')}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="kanban-board p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">Kanban Board</h1>
          <p className="mt-2 text-sm text-[#8b8ba0]">Move tasks through the enforced workflow without losing project context.</p>
        </div>
        <span className="rounded-full border border-[#2e2e45] bg-[#1a1a24] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8b8ba0]">
          {tasks.length} tasks
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {Object.entries(tasksByStatus).map(([status, taskList]) => (
          <div key={status} className="kanban-column rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${statusAccent[status]}`} />
                <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-white">
                  {status.replace('_', ' ')}
                </h2>
              </div>
              <span className="rounded-full bg-[#22223a] px-2 py-0.5 text-xs font-semibold text-[#8b8ba0]">
                {taskList.length}
              </span>
            </div>
            <div className="min-h-[160px] space-y-3">
              {taskList.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#2e2e45] p-4 text-center text-xs text-[#8b8ba0]">
                  No tasks
                </div>
              )}
              {taskList.map(task => (
                <div key={task.id} className="task-item rounded-lg border border-[#2e2e45] bg-[#22223a] p-4">
                  <h3 className="text-sm font-semibold text-white">{task.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs text-[#8b8ba0]">{task.description || 'No description provided.'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                    <span className={`rounded-full border px-2 py-1 ${statusClass[task.status] || statusClass.TODO}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`rounded-full px-2 py-1 ${priorityClass[task.priority] || priorityClass.MEDIUM}`}>
                      {task.priorityLabel ?? task.priority}
                    </span>
                    <span className="rounded-full bg-[#0f0f13] px-2 py-1 text-[#c7c7d6]">
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
