import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { workspaceApi } from '../api/workspaceApi';
import type { Project } from '../types';

interface ProjectWithWorkspace extends Project {
  workspaceName: string;
}

const statusClass: Record<string, string> = {
  PLANNED: 'bg-slate-500/10 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-300',
  ON_HOLD: 'bg-amber-500/10 text-amber-300',
  COMPLETED: 'bg-emerald-500/10 text-emerald-300',
  ARCHIVED: 'bg-slate-500/10 text-slate-400',
};

const priorityClass: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-300',
  MEDIUM: 'bg-amber-500/10 text-amber-300',
  HIGH: 'bg-red-500/10 text-red-300',
  URGENT: 'bg-red-500/20 text-red-200',
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const workspaces = await workspaceApi.getWorkspaces();
      const groups = await Promise.all(
        workspaces.map(async (workspace) => {
          const workspaceProjects = await projectApi.getProjects(workspace.id);
          return workspaceProjects.map((project) => ({
            ...project,
            workspaceName: workspace.name,
          }));
        })
      );
      setProjects(groups.flat());
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [loadProjects]);

  const counts = useMemo(() => ({
    total: projects.length,
    active: projects.filter((project) => project.status === 'IN_PROGRESS').length,
    onHold: projects.filter((project) => project.status === 'ON_HOLD').length,
  }), [projects]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-12 w-56 animate-pulse rounded-xl bg-[#141d2d]" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-xl border border-[#223047] bg-[#121a29]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="mt-2 text-sm text-[#8a94a6]">All active study, development, and portfolio work in one place.</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-[#c5cbd8]">
          <span className="rounded-lg border border-[#223047] bg-[#121a29] px-3 py-2">{counts.total} total</span>
          <span className="rounded-lg border border-[#223047] bg-[#121a29] px-3 py-2">{counts.active} active</span>
          <span className="rounded-lg border border-[#223047] bg-[#121a29] px-3 py-2">{counts.onHold} on hold</span>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#223047] bg-[#121a29] p-8 text-center">
          <h2 className="text-sm font-semibold text-white">No projects yet</h2>
          <p className="mt-2 text-sm text-[#8a94a6]">Create a workspace project to start planning.</p>
          <Link className="mt-4 inline-flex rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white" to="/workspaces">
            Open workspaces
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} className="rounded-xl border border-[#223047] bg-[#121a29] p-5 hover:border-[#8b5cf6]/70" to={`/projects/${project.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-[#8a94a6]">{project.workspaceName}</p>
                  <h2 className="mt-2 truncate text-lg font-semibold text-white">{project.name}</h2>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-xs font-semibold text-purple-300">
                  {project.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 min-h-10 text-sm text-[#8a94a6]">{project.description || 'No description provided.'}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className={`rounded-md px-2 py-1 ${statusClass[project.status] ?? statusClass.PLANNED}`}>{project.status.replace('_', ' ')}</span>
                <span className={`rounded-md px-2 py-1 ${priorityClass[project.priority] ?? priorityClass.MEDIUM}`}>{project.priority}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
