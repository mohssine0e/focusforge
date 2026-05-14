import React, { useCallback, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import type { Project, Task, TaskDependency, TaskRequest, TaskType } from '../types';

const statusClass: Record<string, string> = {
  TODO: 'border border-[#55556a] bg-[#55556a]/15 text-[#c7c7d6]',
  IN_PROGRESS: 'border border-[#7c6ef7] bg-[#7c6ef7]/15 text-[#bdb7ff]',
  BLOCKED: 'border border-[#e05555] bg-[#e05555]/15 text-[#ffb7b7]',
  REVIEW: 'border border-[#f0a500] bg-[#f0a500]/15 text-[#ffd27a]',
  DONE: 'border border-[#22c55e] bg-[#22c55e]/15 text-[#86efac]',
};

const priorityClass: Record<string, string> = {
  LOW: 'bg-[#55556a]/20 text-[#b8b8c8]',
  MEDIUM: 'bg-[#f0a500]/20 text-[#ffd27a]',
  HIGH: 'bg-[#e07855]/20 text-[#ffb092]',
  URGENT: 'bg-[#e05555]/20 text-[#ffb7b7]',
};

type TaskSortOption = 'none' | 'priority' | 'deadline' | 'status';
type RecommendationStrategy = 'priority' | 'deadline' | 'shortest';

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof err.response === 'object' &&
    err.response !== null &&
    'data' in err.response &&
    typeof err.response.data === 'object' &&
    err.response.data !== null &&
    'message' in err.response.data &&
    typeof err.response.data.message === 'string'
  ) {
    return err.response.data.message;
  }

  return fallback;
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependenciesByTask, setDependenciesByTask] = useState<Record<number, TaskDependency[]>>({});
  const [dependencySelections, setDependencySelections] = useState<Record<number, string>>({});
  const [dependencyErrors, setDependencyErrors] = useState<Record<number, string>>({});
  const [dependencyBusyTaskId, setDependencyBusyTaskId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<TaskSortOption>('none');
  const [recommendationStrategy, setRecommendationStrategy] = useState<RecommendationStrategy>('priority');
  const [recommendedTask, setRecommendedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<number | null>(null);
  const [newTask, setNewTask] = useState<TaskRequest>({
    title: '',
    description: '',
    type: 'STUDY',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    estimatedMinutes: 60,
  });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState<TaskRequest>({
    title: '',
    description: '',
    type: 'STUDY',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    estimatedMinutes: 60,
  });

  const fetchProject = useCallback(async (projectId: number) => {
    try {
      const data = await projectApi.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError('Failed to fetch project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependencies = useCallback(async (projectTasks: Task[]) => {
    const entries = await Promise.all(
      projectTasks.map(async (task) => {
        const dependencies = await taskApi.getDependencies(task.id);
        return [task.id, dependencies] as const;
      })
    );

    setDependenciesByTask(Object.fromEntries(entries));
  }, []);

  const fetchTasks = useCallback(async (projectId: number, sort?: string) => {
    try {
      const data = await taskApi.getTasksByProject(projectId, sort);
      setTasks(data);
      await loadDependencies(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    }
  }, [loadDependencies]);

  const fetchRecommendedTask = useCallback(async (projectId: number, strategy: RecommendationStrategy) => {
    try {
      const data = await taskApi.getRecommendedTask(projectId, strategy);
      setRecommendedTask(data);
    } catch (err) {
      setError('Failed to fetch recommended task');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (id) {
      const projectId = parseInt(id);
      const sort = sortOption === 'none' ? undefined : sortOption;
      fetchProject(projectId);
      fetchTasks(projectId, sort);
      fetchRecommendedTask(projectId, recommendationStrategy);
    }
  }, [fetchProject, fetchRecommendedTask, fetchTasks, id, recommendationStrategy, sortOption]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!newTask.title.trim()) {
      setTaskFormError('Task title is required.');
      return;
    }

    try {
      setCreatingTask(true);
      setTaskFormError(null);
      const data = await taskApi.createTask(parseInt(id), newTask);
      const nextTasks = [...tasks, data];
      setTasks(nextTasks);
      await loadDependencies(nextTasks);
      setNewTask({
        title: '',
        description: '',
        type: 'STUDY',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: '',
        estimatedMinutes: 60,
      });
      await fetchRecommendedTask(parseInt(id), recommendationStrategy);
    } catch (err) {
      setTaskFormError('Failed to create task');
      console.error(err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleAddDependency = async (taskId: number) => {
    const selectedTaskId = Number(dependencySelections[taskId]);

    if (!selectedTaskId) {
      setDependencyErrors((current) => ({
        ...current,
        [taskId]: 'Choose a task dependency first.',
      }));
      return;
    }

    try {
      setDependencyBusyTaskId(taskId);
      await taskApi.addDependency(taskId, selectedTaskId);
      const dependencies = await taskApi.getDependencies(taskId);
      setDependenciesByTask((current) => ({ ...current, [taskId]: dependencies }));
      setDependencySelections((current) => ({ ...current, [taskId]: '' }));
      setDependencyErrors((current) => ({ ...current, [taskId]: '' }));
    } catch (err) {
      setDependencyErrors((current) => ({
        ...current,
        [taskId]: getErrorMessage(err, 'Failed to add dependency'),
      }));
      console.error(err);
    } finally {
      setDependencyBusyTaskId(null);
    }
  };

  const handleRemoveDependency = async (taskId: number, dependsOnTaskId: number) => {
    try {
      setDependencyBusyTaskId(taskId);
      await taskApi.removeDependency(taskId, dependsOnTaskId);
      const dependencies = await taskApi.getDependencies(taskId);
      setDependenciesByTask((current) => ({ ...current, [taskId]: dependencies }));
      setDependencyErrors((current) => ({ ...current, [taskId]: '' }));
    } catch (err) {
      setDependencyErrors((current) => ({
        ...current,
        [taskId]: getErrorMessage(err, 'Failed to remove dependency'),
      }));
      console.error(err);
    } finally {
      setDependencyBusyTaskId(null);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditFormError(null);
    setEditTask({
      title: task.title,
      description: task.description ?? '',
      type: task.type,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      estimatedMinutes: task.estimatedMinutes ?? 60,
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;

    if (!editTask.title?.trim()) {
      setEditFormError('Task title is required.');
      return;
    }

    try {
      setUpdatingTask(true);
      setEditFormError(null);
      const updatedTask = await taskApi.updateTask(editingTaskId, editTask);
      setTasks(tasks.map((task) => (task.id === editingTaskId ? updatedTask : task)));
      setEditingTaskId(null);
      if (id) {
        await fetchRecommendedTask(parseInt(id), recommendationStrategy);
      }
    } catch (err) {
      setEditFormError('Failed to update task');
      console.error(err);
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setDeletingTaskId(taskId);
      await taskApi.deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setConfirmDeleteTaskId(null);
      if (id) {
        await fetchRecommendedTask(parseInt(id), recommendationStrategy);
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (loading && !project) {
    return (
      <div className="space-y-6 px-4">
        <div className="h-5 w-36 animate-pulse rounded bg-[#22223a]" />
        <div className="rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-6">
          <div className="h-8 w-64 animate-pulse rounded bg-[#22223a]" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-[#22223a]" />
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail space-y-6 px-4">
      <Link className="text-sm font-medium text-cyan-300 hover:text-cyan-200" to={project ? `/workspaces/${project.workspaceId}` : '/workspaces'}>
        Back to workspace
      </Link>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">{project?.name}</h1>
            <p className="mt-2 max-w-3xl text-slate-400">{project?.description}</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-200">{project?.status}</span>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-200">{project?.priority}</span>
          </div>
        </div>
      </section>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <div className="project-detail-content grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="task-form rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-semibold text-white">Create Task</h2>
          <form className="space-y-3" onSubmit={handleCreateTask}>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => {
                setNewTask({...newTask, title: e.target.value});
                setTaskFormError(null);
              }}
            />
            <textarea
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={newTask.type}
              onChange={(e) => setNewTask({...newTask, type: e.target.value as TaskType})}
            >
              <option value="STUDY">Study</option>
              <option value="CODING">Coding</option>
              <option value="RESEARCH">Research</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskRequest['priority'] })}
              >
                <option value="LOW">Low priority</option>
                <option value="MEDIUM">Medium priority</option>
                <option value="HIGH">High priority</option>
                <option value="URGENT">Urgent priority</option>
              </select>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                min={1}
                type="number"
                value={newTask.estimatedMinutes ?? ''}
                onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Estimate minutes"
              />
            </div>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              type="datetime-local"
              value={newTask.dueDate ?? ''}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            {taskFormError && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{taskFormError}</p>}
            <button
              className="w-full rounded-md bg-cyan-400 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={creatingTask || !newTask.title.trim()}
              type="submit"
            >
              {creatingTask ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>

        <div className="tasks-list space-y-4">
          <h2 className="text-2xl font-semibold text-white">Tasks</h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.5fr]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sort tasks</span>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as TaskSortOption)}
                >
                  <option value="none">Default order</option>
                  <option value="priority">Priority</option>
                  <option value="deadline">Deadline</option>
                  <option value="status">Status</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recommendation</span>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={recommendationStrategy}
                  onChange={(e) => setRecommendationStrategy(e.target.value as RecommendationStrategy)}
                >
                  <option value="priority">Priority first</option>
                  <option value="deadline">Deadline first</option>
                  <option value="shortest">Shortest task first</option>
                </select>
              </label>

              <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Recommended next task</p>
                {recommendedTask ? (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-white">{recommendedTask.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                      <span className={`rounded-full px-2 py-1 ${statusClass[recommendedTask.status] ?? statusClass.TODO}`}>
                        {recommendedTask.status}
                      </span>
                      <span className={`rounded-full px-2 py-1 ${priorityClass[recommendedTask.priority] ?? priorityClass.MEDIUM}`}>
                        {recommendedTask.priorityLabel ?? recommendedTask.priority}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
                        {recommendedTask.estimatedMinutes ?? 0} min
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">No open tasks to recommend.</p>
                )}
              </div>
            </div>
          </div>
          {tasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-400">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-xs font-bold text-cyan-300">
                  TK
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-200">No tasks yet</h3>
                <p className="mt-1 text-xs text-slate-500">Create the first task to start planning this project.</p>
              </div>
            </div>
          )}
          {tasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const dependencies = dependenciesByTask[task.id] ?? [];
            const dependencyTaskIds = new Set(dependencies.map((dependency) => dependency.dependsOnTaskId));
            const openDependencies = dependencies.filter((dependency) => dependency.dependsOnTaskStatus !== 'DONE');
            const availableDependencyTasks = tasks.filter((candidate) => (
              candidate.id !== task.id && !dependencyTaskIds.has(candidate.id)
            ));

            return (
              <div key={task.id} className="task-item rounded-lg border border-slate-800 bg-slate-900 p-5">
                {isEditing ? (
                  <form className="space-y-3" onSubmit={handleUpdateTask}>
                    <input
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      value={editTask.title}
                      onChange={(e) => {
                        setEditTask({ ...editTask, title: e.target.value });
                        setEditFormError(null);
                      }}
                    />
                    <textarea
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      value={editTask.description}
                      onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    />
                    <select
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      value={editTask.type}
                      onChange={(e) => setEditTask({ ...editTask, type: e.target.value as TaskType })}
                    >
                      <option value="STUDY">Study</option>
                      <option value="CODING">Coding</option>
                      <option value="RESEARCH">Research</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        value={editTask.priority}
                        onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as TaskRequest['priority'] })}
                      >
                        <option value="LOW">Low priority</option>
                        <option value="MEDIUM">Medium priority</option>
                        <option value="HIGH">High priority</option>
                        <option value="URGENT">Urgent priority</option>
                      </select>
                      <input
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        min={1}
                        type="number"
                        value={editTask.estimatedMinutes ?? ''}
                        onChange={(e) => setEditTask({ ...editTask, estimatedMinutes: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <input
                      className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                      type="datetime-local"
                      value={editTask.dueDate ?? ''}
                      onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                    />
                    {editFormError && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{editFormError}</p>}
                    <div className="flex gap-2">
                      <button
                        className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={updatingTask || !editTask.title?.trim()}
                        type="submit"
                      >
                        {updatingTask ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                        disabled={updatingTask}
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                        <span className={`rounded-full px-2 py-1 ${statusClass[task.status] ?? statusClass.TODO}`}>{task.status}</span>
                        <span className={`rounded-full px-2 py-1 ${priorityClass[task.priority] ?? priorityClass.MEDIUM}`}>{task.priority}</span>
                        <span className="rounded-full bg-fuchsia-400/10 px-2 py-1 text-fuchsia-200">{task.type}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      {task.priorityLabel && <span>{task.priorityLabel}</span>}
                      {task.estimatedMinutes && <span>{task.estimatedMinutes} min estimate</span>}
                      {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleString()}</span>}
                    </div>
                    {(task.overdue || task.dueSoon || task.dependencyWarning) && (
                      <div className="mt-3 flex flex-col gap-2">
                        {task.overdue && (
                          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                            Overdue task
                          </div>
                        )}
                        {task.dueSoon && (
                          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                            Due soon
                          </div>
                        )}
                        {task.dependencyWarning && (
                          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                            {task.blockedReason ?? 'Blocked by unfinished dependencies'}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Dependencies</h4>
                        {openDependencies.length > 0 && (
                          <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                            Blocked by {openDependencies.length}
                          </span>
                        )}
                      </div>

                      {openDependencies.length > 0 && (
                        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                          Blocked by dependency: {openDependencies.map((dependency) => dependency.dependsOnTaskTitle).join(', ')}
                        </div>
                      )}

                      <div className="mt-3 space-y-2">
                        {dependencies.length === 0 ? (
                          <p className="rounded-md border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-500">
                            No dependencies yet.
                          </p>
                        ) : (
                          dependencies.map((dependency) => (
                            <div
                              key={dependency.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-100">{dependency.dependsOnTaskTitle}</p>
                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[dependency.dependsOnTaskStatus] ?? statusClass.TODO}`}>
                                  {dependency.dependsOnTaskStatus}
                                </span>
                              </div>
                              <button
                                className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={dependencyBusyTaskId === task.id}
                                onClick={() => handleRemoveDependency(task.id, dependency.dependsOnTaskId)}
                                type="button"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <select
                          className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                          disabled={availableDependencyTasks.length === 0 || dependencyBusyTaskId === task.id}
                          value={dependencySelections[task.id] ?? ''}
                          onChange={(e) => {
                            setDependencySelections((current) => ({ ...current, [task.id]: e.target.value }));
                            setDependencyErrors((current) => ({ ...current, [task.id]: '' }));
                          }}
                        >
                          <option value="">Add dependency</option>
                          {availableDependencyTasks.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.title}
                            </option>
                          ))}
                        </select>
                        <button
                          className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={availableDependencyTasks.length === 0 || dependencyBusyTaskId === task.id}
                          onClick={() => handleAddDependency(task.id)}
                          type="button"
                        >
                          {dependencyBusyTaskId === task.id ? 'Saving...' : 'Add'}
                        </button>
                      </div>

                      {availableDependencyTasks.length === 0 && dependencies.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">All other project tasks are already dependencies.</p>
                      )}
                      {dependencyErrors[task.id] && (
                        <p className="mt-2 text-sm text-red-200">{dependencyErrors[task.id]}</p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deletingTaskId === task.id}
                        onClick={() => startEditing(task)}
                        type="button"
                      >
                        Edit
                      </button>
                      {confirmDeleteTaskId === task.id ? (
                        <>
                          <button
                            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={deletingTaskId === task.id}
                            onClick={() => handleDeleteTask(task.id)}
                            type="button"
                          >
                            {deletingTaskId === task.id ? 'Deleting...' : 'Confirm delete'}
                          </button>
                          <button
                            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                            onClick={() => setConfirmDeleteTaskId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deletingTaskId === task.id}
                          onClick={() => setConfirmDeleteTaskId(task.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
