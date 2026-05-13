import React, { useCallback, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import type { Project, Task, TaskRequest, TaskType } from '../types';

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

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const fetchTasks = useCallback(async (projectId: number) => {
    try {
      const data = await taskApi.getTasksByProject(projectId);
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProject(parseInt(id));
      fetchTasks(parseInt(id));
    }
  }, [fetchProject, fetchTasks, id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const data = await taskApi.createTask(parseInt(id), newTask);
      setTasks([...tasks, data]);
      setNewTask({
        title: '',
        description: '',
        type: 'STUDY'
      });
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
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
          {tasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-400">
              No tasks yet. Create the first one to start planning this project.
            </div>
          )}
          {tasks.map((task) => {
            const isEditing = editingTaskId === task.id;

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
