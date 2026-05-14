import React, { useCallback, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import type { Project, Task, TaskDependency, TaskRequest, TaskType } from '../types';

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
  const [newTask, setNewTask] = useState<TaskRequest>({
    title: '',
    description: '',
    type: 'STUDY'
  });
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState<TaskRequest>({
    title: '',
    description: '',
    type: 'STUDY',
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProject(projectId);
      fetchTasks(projectId, sort);
      fetchRecommendedTask(projectId, recommendationStrategy);
    }
  }, [fetchProject, fetchRecommendedTask, fetchTasks, id, recommendationStrategy, sortOption]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const data = await taskApi.createTask(parseInt(id), newTask);
      const nextTasks = [...tasks, data];
      setTasks(nextTasks);
      await loadDependencies(nextTasks);
      setNewTask({
        title: '',
        description: '',
        type: 'STUDY'
      });
      await fetchRecommendedTask(parseInt(id), recommendationStrategy);
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
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
    setEditTask({
      title: task.title,
      description: task.description ?? '',
      type: task.type,
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;

    try {
      const updatedTask = await taskApi.updateTask(editingTaskId, editTask);
      setTasks(tasks.map((task) => (task.id === editingTaskId ? updatedTask : task)));
      setEditingTaskId(null);
      if (id) {
        await fetchRecommendedTask(parseInt(id), recommendationStrategy);
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await taskApi.deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
      if (id) {
        await fetchRecommendedTask(parseInt(id), recommendationStrategy);
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  if (loading && !project) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-slate-300">Loading project...</div>;
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
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
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
            <button className="w-full rounded-md bg-cyan-400 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-300" type="submit">
              Add Task
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
                        {recommendedTask.priority}
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
              No tasks yet. Create the first one to start planning this project.
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
                      onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
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
                    <div className="flex gap-2">
                      <button className="rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300" type="submit">
                        Save
                      </button>
                      <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" type="button" onClick={() => setEditingTaskId(null)}>
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
                      {task.estimatedMinutes && <span>{task.estimatedMinutes} min estimate</span>}
                      {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleString()}</span>}
                    </div>
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
                      <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" onClick={() => startEditing(task)}>
                        Edit
                      </button>
                      <button className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10" onClick={() => handleDeleteTask(task.id)}>
                        Delete
                      </button>
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
