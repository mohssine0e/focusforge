import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { analyticsApi } from '../api/analyticsApi';
import { focusApi } from '../api/focusApi';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { workspaceApi } from '../api/workspaceApi';
import type { AnalyticsOverview, FocusSession, Project, Task } from '../types';

interface ProjectProgressRow {
  id: number;
  name: string;
  status: string;
  completionRate: number;
}

const statusColors: Record<string, string> = {
  TODO: '#7c4dff',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#f5b832',
  BLOCKED: '#ff5b5b',
  DONE: '#4ade80',
};

const priorityClass: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-300',
  MEDIUM: 'bg-amber-500/10 text-amber-300',
  HIGH: 'bg-red-500/10 text-red-300',
  URGENT: 'bg-red-500/20 text-red-200',
};

const projectStatusClass: Record<string, string> = {
  PLANNED: 'bg-slate-500/10 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-300',
  ON_HOLD: 'bg-amber-500/10 text-amber-300',
  COMPLETED: 'bg-emerald-500/10 text-emerald-300',
  ARCHIVED: 'bg-slate-500/10 text-slate-400',
};

const sessionColorClass: Record<string, string> = {
  DEEP_WORK: 'bg-purple-500/20 text-purple-200',
  POMODORO: 'bg-blue-500/20 text-blue-200',
  QUICK_FOCUS: 'bg-emerald-500/20 text-emerald-200',
};

const mapCounts = (counts: Record<string, number>) => (
  Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: statusColors[name] ?? '#8b5cf6',
  }))
);

const formatDate = (date: string) => (
  new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
);

const formatTime = (date: string) => (
  new Date(date).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
);

const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [projectRows, setProjectRows] = useState<ProjectProgressRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjectProgress = useCallback(async () => {
    const workspaces = await workspaceApi.getWorkspaces();
    const projectGroups = await Promise.all(
      workspaces.map((workspace) => projectApi.getProjects(workspace.id))
    );
    const loadedProjects = projectGroups.flat();
    const rows = await Promise.all(
      loadedProjects.map(async (project) => {
        const tasks = await taskApi.getTasksByProject(project.id);
        const completed = tasks.filter((task) => task.status === 'DONE').length;
        const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
        return {
          id: project.id,
          name: project.name,
          status: project.status,
          completionRate,
        };
      })
    );

    setProjects(loadedProjects);
    setProjectRows(rows);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 45);

      const [overviewData, deadlines, sessions] = await Promise.all([
        analyticsApi.getOverview(),
        taskApi.getDueTasks({
          from: today.toISOString().slice(0, 10),
          to: nextMonth.toISOString().slice(0, 10),
        }),
        focusApi.getAllSessions(),
        loadProjectProgress(),
      ]);

      setOverview(overviewData);
      setDueTasks(deadlines);
      setFocusSessions(sessions);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadProjectProgress]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const statusData = useMemo(() => mapCounts(overview?.tasksByStatus ?? {}), [overview]);
  const totalTasks = overview?.totalTasks ?? 0;
  const completionRate = totalTasks > 0
    ? Math.round(((overview?.completedTaskCount ?? 0) / totalTasks) * 100)
    : 0;
  const activeProjects = projects.filter((project) => project.status === 'IN_PROGRESS').length;
  const stats = [
    { label: 'Total Projects', value: overview?.totalProjects ?? 0, meta: `${activeProjects} active now`, icon: 'P', tone: 'text-purple-300 bg-purple-500/15' },
    { label: 'Total Tasks', value: totalTasks, meta: `${overview?.tasksDueThisWeek ?? 0} due this week`, icon: 'T', tone: 'text-indigo-300 bg-indigo-500/15' },
    { label: 'Tasks Completed', value: overview?.completedTaskCount ?? 0, meta: `${completionRate}% completion rate`, icon: 'C', tone: 'text-emerald-300 bg-emerald-500/15' },
    { label: 'Focus Time', value: `${Math.floor((overview?.totalFocusMinutes ?? 0) / 60)}h ${(overview?.totalFocusMinutes ?? 0) % 60}m`, meta: `${focusSessions.length} sessions tracked`, icon: 'F', tone: 'text-violet-300 bg-violet-500/15' },
    { label: 'Completion Rate', value: `${completionRate}%`, meta: `${overview?.blockedTasks ?? 0} blocked tasks`, icon: 'R', tone: 'text-amber-300 bg-amber-500/15' },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-14 w-80 animate-pulse rounded-xl bg-[#141d2d]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl border border-[#223047] bg-[#121a29]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Welcome back, John</h1>
          <p className="mt-2 text-sm text-[#8a94a6]">Here is what is happening with your projects today.</p>
        </div>
        <div className="hidden rounded-full border border-[#223047] bg-[#101827] px-4 py-2 text-xs text-[#8a94a6] lg:block">
          Demo workspace seeded for a full dashboard preview
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#223047] bg-[#121a29] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${stat.tone}`}>
                {stat.icon}
              </div>
              <span className="text-xl leading-none text-[#68738a]">...</span>
            </div>
            <p className="mt-3 text-sm text-[#c5cbd8]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            <p className="mt-3 text-xs text-[#8a94a6]"><span className="text-emerald-400">up</span> {stat.meta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.85fr_1fr]">
        <section className="rounded-xl border border-[#223047] bg-[#121a29] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Tasks by Status</h2>
            <span className="rounded-lg border border-[#223047] bg-[#0b1422] px-3 py-1 text-xs text-[#8a94a6]">This Week</span>
          </div>
          <div className="mt-3 grid min-h-[220px] gap-3 md:grid-cols-[0.95fr_1fr]">
            <div className="relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#121a29', border: '1px solid #223047', borderRadius: 10, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-white">{totalTasks}</span>
                <span className="text-xs text-[#8a94a6]">Tasks</span>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              {statusData.map((item) => {
                const percent = totalTasks === 0 ? 0 : Math.round((item.value / totalTasks) * 100);
                return (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[#c5cbd8]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                      {item.name.replace('_', ' ')}
                    </span>
                    <span className="text-[#8a94a6]">{item.value} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Link className="mt-3 flex h-11 items-center justify-center rounded-lg border border-[#223047] bg-[#101827] text-sm text-[#a78bfa] hover:bg-[#172238]" to="/workspaces">
            View all tasks
          </Link>
        </section>

        <section className="rounded-xl border border-[#223047] bg-[#121a29] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Upcoming Deadlines</h2>
            <Link className="text-xs text-[#a78bfa]" to="/calendar">View all</Link>
          </div>
          <div className="mt-3 divide-y divide-[#223047]">
            {dueTasks.slice(0, 5).map((task) => (
              <Link key={task.id} className="flex items-center gap-3 py-3 hover:bg-[#172238]/50" to={`/projects/${task.projectId}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#223047] bg-[#0b1422] text-xs text-[#c5cbd8]">D</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#dce2ee]">{task.title}</p>
                  <p className="mt-0.5 text-xs text-[#8a94a6]">{formatDate(task.dueDate)}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priorityClass[task.priority] ?? priorityClass.MEDIUM}`}>
                  {task.priority === 'URGENT' ? 'High' : task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#223047] bg-[#121a29] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Focus Sessions</h2>
            <Link className="text-xs text-[#a78bfa]" to="/focus">View all</Link>
          </div>
          <div className="mt-3 divide-y divide-[#223047]">
            {focusSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center gap-3 py-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${sessionColorClass[session.sessionType] ?? sessionColorClass.POMODORO}`}>
                  F
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#dce2ee]">{session.taskTitle}</p>
                  <p className="mt-0.5 text-xs text-[#8a94a6]">{formatTime(session.startTime)}</p>
                </div>
                <span className="text-sm font-medium text-[#a78bfa]">
                  {Math.floor((session.durationMinutes ?? 0) / 60)}h {(session.durationMinutes ?? 0) % 60}m
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-[#223047] bg-[#121a29] p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">Project Progress Overview</h2>
          <span className="rounded-lg border border-[#223047] bg-[#0b1422] px-3 py-1 text-xs text-[#8a94a6]">All Projects</span>
        </div>
        <div className="mt-4 divide-y divide-[#223047]">
          {projectRows.slice(0, 7).map((project) => (
            <Link key={project.id} className="grid items-center gap-4 py-3 hover:bg-[#172238]/50 md:grid-cols-[1.2fr_2fr_52px_88px]" to={`/projects/${project.id}`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-xs font-semibold text-purple-300">
                  {project.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="truncate text-sm text-[#dce2ee]">{project.name}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#202b40]">
                <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${project.completionRate}%` }} />
              </div>
              <span className="text-sm font-medium text-[#dce2ee]">{project.completionRate}%</span>
              <span className={`justify-self-start rounded-md px-2 py-1 text-xs font-semibold ${projectStatusClass[project.status] ?? projectStatusClass.PLANNED}`}>
                {project.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
        <Link className="mt-3 flex h-11 items-center justify-center rounded-lg border border-[#223047] bg-[#101827] text-sm text-[#a78bfa] hover:bg-[#172238]" to="/projects">
          View all projects
        </Link>
      </section>
    </div>
  );
};

export default DashboardPage;
