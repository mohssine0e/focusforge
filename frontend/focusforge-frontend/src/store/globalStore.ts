import { create } from 'zustand';
import type { Project, Task, Workspace } from '../types';

interface GlobalState {
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  currentWorkspaceId: number | null;
  currentProjectId: number | null;
  currentTaskId: number | null;
  setCurrentWorkspaceId: (id: number | null) => void;
  setCurrentProjectId: (id: number | null) => void;
  setCurrentTaskId: (id: number | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  addProject: (project: Project) => void;
  addTask: (task: Task) => void;
  updateWorkspace: (workspace: Workspace) => void;
  updateProject: (project: Project) => void;
  updateTask: (task: Task) => void;
  removeWorkspace: (id: number) => void;
  removeProject: (id: number) => void;
  removeTask: (id: number) => void;
  getCurrentWorkspace: () => Workspace | null;
  getCurrentProject: () => Project | null;
  getCurrentTask: () => Task | null;
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
  workspaces: [],
  projects: [],
  tasks: [],
  currentWorkspaceId: null,
  currentProjectId: null,
  currentTaskId: null,

  setCurrentWorkspaceId: (id: number | null) => set({ currentWorkspaceId: id }),
  setCurrentProjectId: (id: number | null) => set({ currentProjectId: id }),
  setCurrentTaskId: (id: number | null) => set({ currentTaskId: id }),

  setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
  setProjects: (projects: Project[]) => set({ projects }),
  setTasks: (tasks: Task[]) => set({ tasks }),

  addWorkspace: (workspace: Workspace) => {
    const state = get();
    set({ workspaces: [...state.workspaces, workspace] });
  },
  addProject: (project: Project) => {
    const state = get();
    set({ projects: [...state.projects, project] });
  },
  addTask: (task: Task) => {
    const state = get();
    set({ tasks: [...state.tasks, task] });
  },

  updateWorkspace: (workspace: Workspace) => {
    const state = get();
    const index = state.workspaces.findIndex(w => w.id === workspace.id);
    if (index !== -1) {
      const newWorkspaces = [...state.workspaces];
      newWorkspaces[index] = workspace;
      set({ workspaces: newWorkspaces });
    }
  },
  updateProject: (project: Project) => {
    const state = get();
    const index = state.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      const newProjects = [...state.projects];
      newProjects[index] = project;
      set({ projects: newProjects });
    }
  },
  updateTask: (task: Task) => {
    const state = get();
    const index = state.tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      const newTasks = [...state.tasks];
      newTasks[index] = task;
      set({ tasks: newTasks });
    }
  },

  removeWorkspace: (id: number) => {
    const state = get();
    const newWorkspaces = state.workspaces.filter(w => w.id !== id);
    set({ workspaces: newWorkspaces });
  },
  removeProject: (id: number) => {
    const state = get();
    const newProjects = state.projects.filter(p => p.id !== id);
    set({ projects: newProjects });
  },
  removeTask: (id: number) => {
    const state = get();
    const newTasks = state.tasks.filter(t => t.id !== id);
    set({ tasks: newTasks });
  },

  getCurrentWorkspace: () => {
    const state = get();
    return state.workspaces.find(w => w.id === state.currentWorkspaceId) || null;
  },
  getCurrentProject: () => {
    const state = get();
    return state.projects.find(p => p.id === state.currentProjectId) || null;
  },
  getCurrentTask: () => {
    const state = get();
    return state.tasks.find(t => t.id === state.currentTaskId) || null;
  }
}));
