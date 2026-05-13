import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchProjects();
  }, [workspaceId]);

  const fetchProjects = async () => {
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
  };

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
    <div className="project-list">
      <h2>Projects</h2>

      <form onSubmit={handleCreate}>
        <h3>Create New Project</h3>
        <div>
          <input
            type="text"
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
        </div>
        <div>
          <select
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
            value={newProject.priority}
            onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <button type="submit">Create Project</button>
      </form>

      {error && <div className="error">{error}</div>}

      <div>
        {projects.map((project) => (
          <div key={project.id} className="project-item">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <button onClick={() => handleDelete(project.id)}>Delete</button>
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