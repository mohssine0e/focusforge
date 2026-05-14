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
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWorkspace, setEditWorkspace] = useState<CreateWorkspaceRequest>({ name: '', description: '' });
  const [newWorkspace, setNewWorkspace] = useState<CreateWorkspaceRequest>({
    name: '',
    description: ''
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workspaceApi.getWorkspaces();
      setWorkspaces(data);
      setError(null);
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

    if (!newWorkspace.name.trim()) {
      setFormError('Workspace name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await workspaceApi.createWorkspace(newWorkspace);
      setNewWorkspace({ name: '', description: '' });
      await fetchWorkspaces();
    } catch (err) {
      setFormError('Failed to create workspace');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await workspaceApi.deleteWorkspace(id);
      setConfirmDeleteId(null);
      await fetchWorkspaces();
    } catch (err) {
      setError('Failed to delete workspace');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (workspace: Workspace) => {
    setEditingId(workspace.id);
    setEditWorkspace({ name: workspace.name, description: workspace.description ?? '' });
    setFormError(null);
  };

  const handleUpdate = async (id: number) => {
    if (!editWorkspace.name.trim()) {
      setFormError('Workspace name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await workspaceApi.updateWorkspace(id, editWorkspace);
      setEditingId(null);
      await fetchWorkspaces();
    } catch (err) {
      setFormError('Failed to update workspace');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !workspaces.length) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-[#141d2d]" />
        <div className="rounded-xl border border-[#223047] bg-[#121a29] p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-[#172238]" />
          <div className="mt-4 h-10 animate-pulse rounded bg-[#172238]" />
          <div className="mt-3 h-24 animate-pulse rounded bg-[#172238]" />
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-list space-y-6">
      <h1 className="text-3xl font-semibold text-white">Workspaces</h1>

      <form onSubmit={handleCreate} className="rounded-xl border border-[#223047] bg-[#121a29] p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-white">Create New Workspace</h2>
        <div>
          <input
            className="mb-2 w-full rounded-md border border-[#223047] bg-[#07111d] px-3 py-2 text-[#f0f0f5] outline-none placeholder:text-[#69758a] focus:border-[#8b5cf6]"
            type="text"
            placeholder="Workspace name"
            value={newWorkspace.name}
            onChange={(e) => {
              setNewWorkspace({...newWorkspace, name: e.target.value});
              setFormError(null);
            }}
          />
        </div>
        <div>
          <textarea
            className="mb-2 w-full rounded-md border border-[#223047] bg-[#07111d] px-3 py-2 text-[#f0f0f5] outline-none placeholder:text-[#69758a] focus:border-[#8b5cf6]"
            placeholder="Description"
            value={newWorkspace.description}
            onChange={(e) => setNewWorkspace({...newWorkspace, description: e.target.value})}
          />
        </div>
        {formError && <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{formError}</p>}
        <button
          className="rounded-md bg-[#8b5cf6] px-4 py-2 font-medium text-white hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting || !newWorkspace.name.trim()}
          type="submit"
        >
          {submitting ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="workspace-item rounded-xl border border-[#223047] bg-[#121a29] p-5">
            {editingId === workspace.id ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded-md border border-[#223047] bg-[#07111d] px-3 py-2 text-[#f0f0f5] outline-none focus:border-[#8b5cf6]"
                  value={editWorkspace.name}
                  onChange={(event) => setEditWorkspace({ ...editWorkspace, name: event.target.value })}
                />
                <textarea
                  className="w-full rounded-md border border-[#223047] bg-[#07111d] px-3 py-2 text-[#f0f0f5] outline-none focus:border-[#8b5cf6]"
                  value={editWorkspace.description}
                  onChange={(event) => setEditWorkspace({ ...editWorkspace, description: event.target.value })}
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white">{workspace.name}</h2>
                <p className="mt-2 text-sm text-[#8a94a6]">{workspace.description || 'No description provided.'}</p>
              </>
            )}
            <div className="mt-4 flex gap-2">
              {editingId === workspace.id ? (
                <>
                  <button className="rounded-md bg-[#8b5cf6] px-3 py-2 text-sm font-medium text-white hover:bg-[#7c3aed]" disabled={submitting} onClick={() => handleUpdate(workspace.id)} type="button">
                    Save
                  </button>
                  <button className="rounded-md border border-[#223047] px-3 py-2 text-sm text-[#c5cbd8] hover:bg-[#172238]" disabled={submitting} onClick={() => setEditingId(null)} type="button">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="rounded-md bg-[#8b5cf6] px-3 py-2 text-sm font-medium text-white hover:bg-[#7c3aed]"
                    to={`/workspaces/${workspace.id}`}
                  >
                    Open workspace
                  </Link>
                  <button className="rounded-md border border-[#223047] px-3 py-2 text-sm text-[#c5cbd8] hover:bg-[#172238]" onClick={() => startEdit(workspace)} type="button">
                    Edit
                  </button>
                  {confirmDeleteId === workspace.id ? (
                    <>
                      <button
                        className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400"
                        disabled={deletingId === workspace.id}
                        onClick={() => handleDelete(workspace.id)}
                        type="button"
                      >
                        {deletingId === workspace.id ? 'Deleting...' : 'Confirm delete'}
                      </button>
                      <button className="rounded-md border border-[#223047] px-3 py-2 text-sm text-[#c5cbd8] hover:bg-[#172238]" onClick={() => setConfirmDeleteId(null)} type="button">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="rounded-md border border-red-500/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
                      onClick={() => setConfirmDeleteId(workspace.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#223047] bg-[#121a29] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#223047] bg-[#172238] text-xs font-bold text-[#a78bfa]">
            WS
          </div>
          <h2 className="mt-3 text-sm font-semibold text-white">No workspaces yet</h2>
          <p className="mt-1 max-w-sm text-xs text-[#8a94a6]">Create your first workspace to organize projects and tasks.</p>
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;
