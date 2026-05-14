import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { focusApi } from '../api/focusApi';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { workspaceApi } from '../api/workspaceApi';
import type { FocusSession, FocusSessionType, Task } from '../types';

interface FocusTaskOption extends Task {
  projectId: number;
  projectName: string;
  workspaceName: string;
}

const sessionTypeLabel: Record<FocusSessionType, string> = {
  POMODORO: 'Pomodoro',
  DEEP_WORK: 'Deep work',
  QUICK_FOCUS: 'Quick focus',
};

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const FocusPage: React.FC = () => {
  const [tasks, setTasks] = useState<FocusTaskOption[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [sessionType, setSessionType] = useState<FocusSessionType>('POMODORO');
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    const workspaces = await workspaceApi.getWorkspaces();
    const workspaceProjectPairs = await Promise.all(
      workspaces.map(async (workspace) => {
        const projects = await projectApi.getProjects(workspace.id);
        return projects.map((project) => ({ workspace, project }));
      })
    );

    const projectPairs = workspaceProjectPairs.flat();
    const taskGroups = await Promise.all(
      projectPairs.map(async ({ workspace, project }) => {
        const projectTasks = await taskApi.getTasksByProject(project.id);
        return projectTasks.map((task) => ({
          ...task,
          projectId: project.id,
          projectName: project.name,
          workspaceName: workspace.name,
        }));
      })
    );

    const loadedTasks = taskGroups.flat();
    setTasks(loadedTasks);
    setSelectedTaskId((current) => current || (loadedTasks[0]?.id.toString() ?? ''));
  }, []);

  const loadSessions = useCallback(async () => {
    const data = await focusApi.getAllSessions();
    setSessions(data);
  }, []);

  const loadActiveSession = useCallback(async () => {
    const session = await focusApi.getActiveSession();
    setActiveSession(session);
    if (session) {
      setSelectedTaskId(session.taskId.toString());
    }
  }, []);

  const loadFocusData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadTasks(), loadSessions(), loadActiveSession()]);
      setError(null);
    } catch (err) {
      setError('Failed to load focus data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadActiveSession, loadSessions, loadTasks]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFocusData();
  }, [loadFocusData]);

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const updateElapsed = () => {
      const startedAt = new Date(activeSession.startTime).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeSession]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id.toString() === selectedTaskId),
    [selectedTaskId, tasks]
  );

  const handleStart = async () => {
    if (!selectedTaskId) {
      setError('Select a task before starting focus mode.');
      return;
    }

    try {
      setActionLoading(true);
      setElapsedSeconds(0);
      const session = await focusApi.startSession(Number(selectedTaskId), sessionType);
      setActiveSession(session);
      await loadSessions();
      setError(null);
    } catch (err) {
      setError('Failed to start focus session');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!activeSession) return;

    try {
      setActionLoading(true);
      await focusApi.finishSession(activeSession.id);
      setActiveSession(null);
      setElapsedSeconds(0);
      await loadSessions();
      setError(null);
    } catch (err) {
      setError('Failed to finish focus session');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeSession) return;

    try {
      setActionLoading(true);
      await focusApi.cancelSession(activeSession.id);
      setActiveSession(null);
      setElapsedSeconds(0);
      await loadSessions();
      setError(null);
    } catch (err) {
      setError('Failed to cancel focus session');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4">
        <div className="h-9 w-48 animate-pulse rounded bg-[#22223a]" />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-96 animate-pulse rounded-xl border border-[#2e2e45] bg-[#1a1a24]" />
          <div className="h-96 animate-pulse rounded-xl border border-[#2e2e45] bg-[#1a1a24]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-semibold text-white">Focus Mode</h1>
        <p className="mt-2 text-[#8b8ba0]">Track focused work sessions against real project tasks.</p>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <label className="flex-1 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active task</span>
              <select
                className="w-full rounded-md border border-[#2e2e45] bg-[#0f0f13] px-3 py-2 text-sm text-[#f0f0f5] outline-none focus:border-[#7c6ef7]"
                disabled={!!activeSession || tasks.length === 0}
                value={selectedTaskId}
                onChange={(event) => setSelectedTaskId(event.target.value)}
              >
                {tasks.length === 0 ? (
                  <option value="">No tasks available</option>
                ) : (
                  tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title} - {task.projectName}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="w-full space-y-2 md:w-56">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Focus type</span>
              <select
                className="w-full rounded-md border border-[#2e2e45] bg-[#0f0f13] px-3 py-2 text-sm text-[#f0f0f5] outline-none focus:border-[#7c6ef7]"
                disabled={!!activeSession}
                value={sessionType}
                onChange={(event) => setSessionType(event.target.value as FocusSessionType)}
              >
                <option value="POMODORO">Pomodoro</option>
                <option value="DEEP_WORK">Deep work</option>
                <option value="QUICK_FOCUS">Quick focus</option>
              </select>
            </label>
          </div>

          <div className="mt-8 rounded-xl border border-[#2e2e45] bg-[#0f0f13] p-8 text-center">
            <div className="mx-auto flex h-56 w-56 flex-col items-center justify-center rounded-full border border-[#7c6ef7]/50 bg-[#1a1a24] shadow-[0_0_0_12px_rgba(124,110,247,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#bdb7ff]">
                {activeSession ? sessionTypeLabel[activeSession.sessionType] : sessionTypeLabel[sessionType]}
              </p>
              <div className="mt-3 text-6xl font-semibold text-white">{formatSeconds(elapsedSeconds)}</div>
            </div>
            <p className="mx-auto mt-6 max-w-md text-sm text-[#8b8ba0]">
              {activeSession && selectedTask
                ? `Focusing on ${selectedTask.title}`
                : selectedTask
                  ? `Ready for ${selectedTask.title}`
                  : 'Create a task before starting a focus session.'}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!activeSession ? (
                <button
                  className="rounded-md bg-[#7c6ef7] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6c5ee0] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={actionLoading || tasks.length === 0}
                  onClick={handleStart}
                  type="button"
                >
                  {actionLoading ? 'Starting...' : 'Start session'}
                </button>
              ) : (
                <>
                  <button
                    className="rounded-md bg-[#22c55e] px-5 py-2 text-sm font-semibold text-[#0f0f13] hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={actionLoading}
                    onClick={handleFinish}
                    type="button"
                  >
                    {actionLoading ? 'Saving...' : 'Finish'}
                  </button>
                  <button
                    className="rounded-md border border-red-500/40 px-5 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={actionLoading}
                    onClick={handleCancel}
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Session History</h2>
            <button
              className="rounded-md border border-[#2e2e45] px-3 py-2 text-xs font-medium text-[#f0f0f5] hover:bg-[#22223a]"
              onClick={loadSessions}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {sessions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2e2e45] p-6 text-center">
                <p className="text-sm font-semibold text-[#f0f0f5]">No focus sessions yet</p>
                <p className="mt-1 text-xs text-[#8b8ba0]">Finished and cancelled sessions will appear here.</p>
              </div>
            ) : (
              sessions.slice(0, 8).map((session) => (
                <div key={session.id} className="rounded-lg border border-[#2e2e45] bg-[#22223a] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{session.taskTitle}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {sessionTypeLabel[session.sessionType]} - {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      session.completed ? 'bg-emerald-400/10 text-emerald-200' : 'bg-slate-400/10 text-slate-200'
                    }`}>
                      {session.completed ? 'Completed' : 'Cancelled'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    Duration: {session.durationMinutes ?? 0} min
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FocusPage;
