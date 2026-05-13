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
    try {
      await projectApi.createProject(workspaceId, newProject);
      // Reset form
      setNewProject({
        name: '',
        description: '',
        status: 'PLANNED',
        priority: 'MEDIUM',
        startDate: '',
        dueDate: ''
      });
      // Refresh projects
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    }
  };

  const handleDelete = async (projectId: number) => {
    try {
      await projectApi.deleteProject(projectId);
      // Refresh projects after deletion
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  if (loading && !projects.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="project-list space-y-6">
      <h2 className="text-2xl font-semibold text-white">Projects</h2>

      <form onSubmit={handleCreate} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Create New Project</h3>
        <div>
          <input
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            type="text"
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
        </div>
        <div>
          <textarea
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
        </div>
        <div>
          <select
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
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
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={newProject.priority}
            onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <button className="rounded-md bg-cyan-400 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-300" type="submit">
          Create Project
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="project-item rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{project.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs font-semibold uppercase tracking-wide">
                <span className="rounded-full bg-blue-400/10 px-2 py-1 text-blue-200">{project.status}</span>
                <span className="rounded-full bg-amber-400/10 px-2 py-1 text-amber-200">{project.priority}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-white"
                to={`/projects/${project.id}`}
              >
                Open project
              </Link>
              <button
                className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
                onClick={() => handleDelete(project.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div>No projects found. Create your first project above.</div>
      )}
    </div>
  );
};

export default ProjectList;
