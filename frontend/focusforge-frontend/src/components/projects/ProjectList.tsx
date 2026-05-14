import React, { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CreateProjectRequest } from '../../api/projectApi';
import { projectApi } from '../../api/projectApi';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
}

const ProjectList: React.FunctionComponent<{ workspaceId: number }> = ({ workspaceId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    status: 'PLANNED',
    priority: 'MEDIUM',
    startDate: '',
    dueDate: ''
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getProjects(workspaceId);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProject.name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await projectApi.createProject(workspaceId, newProject);
      setNewProject({
        name: '',
        description: '',
        status: 'PLANNED',
        priority: 'MEDIUM',
        startDate: '',
        dueDate: ''
      });
      await fetchProjects();
    } catch (err) {
      setFormError('Failed to create project');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm('Delete this project and its tasks?')) {
      return;
    }

    try {
      setDeletingId(projectId);
      await projectApi.deleteProject(projectId);
      await fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && !projects.length) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-[#22223a]" />
        <div className="rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-5">
          <div className="h-5 w-36 animate-pulse rounded bg-[#22223a]" />
          <div className="mt-4 h-10 animate-pulse rounded bg-[#22223a]" />
          <div className="mt-3 h-24 animate-pulse rounded bg-[#22223a]" />
        </div>
      </div>
    );
  }

  return (
    <div className="project-list space-y-6">
      <h2 className="text-2xl font-semibold text-white">Projects</h2>

      <form onSubmit={handleCreate} className="rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Create New Project</h3>
        <div>
          <input
            className="mb-2 w-full rounded-md border border-[#2e2e45] bg-[#0f0f13] px-3 py-2 text-[#f0f0f5] outline-none placeholder:text-[#55556a] focus:border-[#7c6ef7]"
            type="text"
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) => {
              setNewProject({ ...newProject, name: e.target.value });
              setFormError(null);
            }}
          />
        </div>
        <div>
          <textarea
            className="mb-2 w-full rounded-md border border-[#2e2e45] bg-[#0f0f13] px-3 py-2 text-[#f0f0f5] outline-none placeholder:text-[#55556a] focus:border-[#7c6ef7]"
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
        </div>
        <div>
          <select
            className="mb-2 w-full rounded-md border border-[#2e2e45] bg-[#0f0f13] px-3 py-2 text-[#f0f0f5] outline-none focus:border-[#7c6ef7]"
            value={newProject.status}
            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <select
            className="mb-2 w-full rounded-md border border-[#2e2e45] bg-[#0f0f13] px-3 py-2 text-[#f0f0f5] outline-none focus:border-[#7c6ef7]"
            value={newProject.priority}
            onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        {formError && <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{formError}</p>}
        <button
          className="rounded-md bg-[#7c6ef7] px-4 py-2 font-medium text-white hover:bg-[#6c5ee0] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting || !newProject.name.trim()}
          type="submit"
        >
          {submitting ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="project-item rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <p className="mt-2 text-sm text-[#8b8ba0]">{project.description || 'No description provided.'}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs font-semibold uppercase tracking-wide">
                <span className="rounded-full bg-[#7c6ef7]/10 px-2 py-1 text-[#bdb7ff]">{project.status}</span>
                <span className="rounded-full bg-[#f0a500]/10 px-2 py-1 text-[#ffd27a]">{project.priority}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                className="rounded-md bg-[#7c6ef7] px-3 py-2 text-sm font-medium text-white hover:bg-[#6c5ee0]"
                to={`/projects/${project.id}`}
              >
                Open project
              </Link>
              <button
                className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
                disabled={deletingId === project.id}
                onClick={() => handleDelete(project.id)}
                type="button"
              >
                {deletingId === project.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2e2e45] bg-[#1a1a24] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2e2e45] bg-[#22223a] text-xs font-bold text-[#7c6ef7]">
            PR
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white">No projects yet</h3>
          <p className="mt-1 max-w-sm text-xs text-[#8b8ba0]">Create a project to start planning tasks, deadlines, and focus work.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
