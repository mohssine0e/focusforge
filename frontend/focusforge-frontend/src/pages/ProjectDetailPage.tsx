import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import type { Project } from '../../api/projectApi';
import type { Task } from '../../api/taskApi';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'STUDY'
  });

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
      fetchTasks(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      const data = await projectApi.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError('Failed to fetch project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId: number) => {
    try {
      const data = await taskApi.getTasksByProject(projectId);
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        type: newTask.type
      };
      const data = await taskApi.createTask(parseInt(id), taskData);
      // Add new task to the list
      setTasks([...tasks, data]);
      // Reset form
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

  if (loading && !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="project-detail">
      <h1>{project?.name}</h1>
      <p>{project?.description}</p>

      <div className="project-detail-content">
        <div className="task-form">
          <h2>Create Task</h2>
          <form onSubmit={handleCreateTask}>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({...newTask, type: e.target.value})}
            >
              <option value="STUDY">Study</option>
              <option value="CODING">Coding</option>
              <option value="RESEARCH">Research</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit">Add Task</button>
          </form>
        </div>

        <div className="tasks-list">
          <h2>Tasks</h2>
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Type: {task.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;