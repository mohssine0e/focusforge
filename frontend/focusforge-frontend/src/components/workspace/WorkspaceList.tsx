import React, { useState, useEffect } from 'react';
import type { CreateWorkspaceRequest } from '../../api/workspaceApi';
import { workspaceApi } from '../../api/workspaceApi';

interface Workspace {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const WorkspaceList: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkspace, setNewWorkspace] = useState<CreateWorkspaceRequest>({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
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
  };

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
    <div className="workspace-list">
      <h1>Workspaces</h1>

      <form onSubmit={handleCreate}>
        <h2>Create New Workspace</h2>
        <div>
          <input
            type="text"
            placeholder="Workspace name"
            value={newWorkspace.name}
            onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={newWorkspace.description}
            onChange={(e) => setNewWorkspace({...newWorkspace, description: e.target.value})}
          />
        </div>
        <button type="submit">Create Workspace</button>
      </form>

      {error && <div className="error">{error}</div>}

      <div>
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="workspace-item">
            <h2>{workspace.name}</h2>
            <p>{workspace.description}</p>
            <button onClick={() => handleDelete(workspace.id)}>Delete</button>
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