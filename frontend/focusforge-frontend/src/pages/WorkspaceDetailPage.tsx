import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { workspaceApi } from '../api/workspaceApi';
import type { Workspace } from '../api/workspaceApi';
import ProjectList from '../components/projects/ProjectList';

const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const hasInvalidWorkspaceId = !Number.isFinite(workspaceId);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasInvalidWorkspaceId) {
      return;
    }

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setWorkspace(await workspaceApi.getWorkspace(workspaceId));
      } catch (err) {
        setError('Failed to fetch workspace');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [hasInvalidWorkspaceId, workspaceId]);

  if (hasInvalidWorkspaceId) {
    return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">Invalid workspace id</div>;
  }

  if (loading) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-slate-300">Loading workspace...</div>;
  }

  if (error || !workspace) {
    return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-100">{error ?? 'Workspace not found'}</div>;
  }

  return (
    <div className="space-y-6 px-4">
      <Link className="text-sm font-medium text-cyan-300 hover:text-cyan-200" to="/workspaces">
        Back to workspaces
      </Link>
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-semibold text-white">{workspace.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-400">{workspace.description}</p>
      </section>
      <ProjectList workspaceId={workspace.id} />
    </div>
  );
};

export default WorkspaceDetailPage;
