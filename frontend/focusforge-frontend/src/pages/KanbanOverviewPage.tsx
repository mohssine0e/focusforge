import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { workspaceApi } from '../api/workspaceApi';

interface KanbanProject {
  id: number;
  name: string;
  workspaceName: string;
  totalTasks: number;
  activeTasks: number;
  blockedTasks: number;
}

const KanbanOverviewPage: React.FC = () => {
  const [projects, setProjects] = useState<KanbanProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKanbanProjects = useCallback(async () => {
    try {
      setLoading(true);
      const workspaces = await workspaceApi.getWorkspaces();
      const projectGroups = await Promise.all(
        workspaces.map(async (workspace) => {
          const workspaceProjects = await projectApi.getProjects(workspace.id);
          return Promise.all(
            workspaceProjects.map(async (project) => {
              const tasks = await taskApi.getTasksByProject(project.id);
              return {
                id: project.id,
                name: project.name,
                workspaceName: workspace.name,
                totalTasks: tasks.length,
                activeTasks: tasks.filter((task) => task.status === 'IN_PROGRESS' || task.status === 'REVIEW').length,
                blockedTasks: tasks.filter((task) => task.status === 'BLOCKED').length,
              };
            })
          );
        })
      );
      setProjects(projectGroups.flat());
      setError(null);
    } catch (err) {
      setError('Failed to load Kanban boards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKanbanProjects();
  }, [loadKanbanProjects]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-12 w-72 animate-pulse rounded-xl bg-[#141d2d]" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-xl border border-[#223047] bg-[#121a29]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Kanban Boards</h1>
        <p className="mt-2 text-sm text-[#8a94a6]">Choose a project board and move tasks through the controlled workflow.</p>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#223047] bg-[#121a29] p-8 text-center">
          <h2 className="text-sm font-semibold text-white">No boards yet</h2>
          <p className="mt-2 text-sm text-[#8a94a6]">Create a project with tasks to open a Kanban board.</p>
          <Link className="mt-4 inline-flex rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white" to="/workspaces">
            Open workspaces
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} className="rounded-xl border border-[#223047] bg-[#121a29] p-5 hover:border-[#8b5cf6]/70" to={`/projects/${project.id}/kanban`}>
              <p className="text-xs uppercase tracking-wide text-[#8a94a6]">{project.workspaceName}</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{project.name}</h2>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#0b1422] p-3">
                  <p className="text-xl font-semibold text-white">{project.totalTasks}</p>
                  <p className="mt-1 text-xs text-[#8a94a6]">Tasks</p>
                </div>
                <div className="rounded-lg bg-[#0b1422] p-3">
                  <p className="text-xl font-semibold text-blue-300">{project.activeTasks}</p>
                  <p className="mt-1 text-xs text-[#8a94a6]">Active</p>
                </div>
                <div className="rounded-lg bg-[#0b1422] p-3">
                  <p className="text-xl font-semibold text-red-300">{project.blockedTasks}</p>
                  <p className="mt-1 text-xs text-[#8a94a6]">Blocked</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default KanbanOverviewPage;
