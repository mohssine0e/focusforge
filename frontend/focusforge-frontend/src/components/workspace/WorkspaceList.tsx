import React, { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CreateWorkspaceRequest } from '../../api/workspaceApi';
import { workspaceApi } from '../../api/workspaceApi';

interface Workspace {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const WorkspaceList: React.FunctionComponent = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkspace, setNewWorkspace] = useState<CreateWorkspaceRequest>({
    name: '',
    description: ''
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workspaceApi.getWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      setError('Failed to fetch workspaces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await workspaceApi.createWorkspace(newWorkspace);
      // Reset form
      setNewWorkspace({ name: '', description: '' });
      // Refresh workspaces
      fetchWorkspaces();
    } catch (err) {
      setError('Failed to create workspace');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await workspaceApi.deleteWorkspace(id);
      // Refresh workspaces
      fetchWorkspaces();
    } catch (err) {
      setError('Failed to delete workspace');
      console.error(err);
    }
  };

  if (loading && !workspaces.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="workspace-list space-y-6">
      <h1 className="text-3xl font-semibold text-white">Workspaces</h1>

      <form onSubmit={handleCreate} className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-white">Create New Workspace</h2>
        <div>
          <input
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            type="text"
            placeholder="Workspace name"
            value={newWorkspace.name}
            onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
          />
        </div>
        <div>
          <textarea
            className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            placeholder="Description"
            value={newWorkspace.description}
            onChange={(e) => setNewWorkspace({...newWorkspace, description: e.target.value})}
          />
        </div>
        <button className="rounded-md bg-cyan-400 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-300" type="submit">
          Create Workspace
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="workspace-item rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">{workspace.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{workspace.description}</p>
            <div className="mt-4 flex gap-2">
              <Link
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-white"
                to={`/workspaces/${workspace.id}`}
              >
                Open workspace
              </Link>
              <button
                className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
                onClick={() => handleDelete(workspace.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && !loading && (
        <div>No workspaces found. Create your first workspace above.</div>
      )}
    </div>
  );
};

export default WorkspaceList;
