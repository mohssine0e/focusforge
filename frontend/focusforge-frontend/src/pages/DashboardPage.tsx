import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyticsApi } from '../api/analyticsApi';
import { healthApi } from '../api/healthApi';
import { projectApi } from '../api/projectApi';
import { taskApi } from '../api/taskApi';
import { workspaceApi } from '../api/workspaceApi';
import type { AnalyticsOverview } from '../types';

interface ProjectProgressRow {
  id: number;
  name: string;
  status: string;
  completionRate: number;
}

const statusColors: Record<string, string> = {
  TODO: '#55556a',
  IN_PROGRESS: '#7c6ef7',
  REVIEW: '#f0a500',
  BLOCKED: '#e05555',
  DONE: '#22c55e',
};

const priorityColors: Record<string, string> = {
  LOW: '#55556a',
  MEDIUM: '#f0a500',
  HIGH: '#e07855',
  URGENT: '#e05555',
};

const mapCounts = (counts: Record<string, number>, colors: Record<string, string>) => (
  Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: colors[name] ?? '#7c6ef7',
  }))
);

const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [projectRows, setProjectRows] = useState<ProjectProgressRow[]>([]);
  const [healthStatus, setHealthStatus] = useState('Checking backend...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjectProgress = useCallback(async () => {
    const workspaces = await workspaceApi.getWorkspaces();
    const projectGroups = await Promise.all(
      workspaces.map((workspace) => projectApi.getProjects(workspace.id))
    );
    const projects = projectGroups.flat();
    const rows = await Promise.all(
      projects.map(async (project) => {
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

    setProjectRows(rows);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, health] = await Promise.all([
        analyticsApi.getOverview(),
        healthApi.getHealth(),
        loadProjectProgress(),
      ]);
      setOverview(overviewData);
      setHealthStatus(health.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadProjectProgress]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statusData = useMemo(() => mapCounts(overview?.tasksByStatus ?? {}, statusColors), [overview]);
  const priorityData = useMemo(() => mapCounts(overview?.tasksByPriority ?? {}, priorityColors), [overview]);
  const completionRate = overview && overview.totalTasks > 0
    ? Math.round((overview.completedTaskCount / overview.totalTasks) * 100)
    : 0;
  const workloadMetrics = [
    { label: 'Due Today', value: overview?.tasksDueToday ?? 0, accent: 'text-[#7c6ef7]' },
    { label: 'Due This Week', value: overview?.tasksDueThisWeek ?? 0, accent: 'text-[#f0a500]' },
    { label: 'Overdue', value: overview?.overdueTasks ?? 0, accent: 'text-[#e05555]' },
    { label: 'High Priority Open', value: overview?.highPriorityOpenTasks ?? 0, accent: 'text-[#e07855]' },
    { label: 'Blocked', value: overview?.blockedTasks ?? 0, accent: 'text-[#e05555]' },
  ];

  if (loading) {
    return <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">{healthStatus}</p>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total Projects', overview?.totalProjects ?? 0],
          ['Total Tasks', overview?.totalTasks ?? 0],
          ['Tasks Completed', overview?.completedTaskCount ?? 0],
          ['Focus Time', `${overview?.totalFocusMinutes ?? 0}m`],
          ['Completion Rate', `${completionRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Workload Snapshot</h2>
            <p className="mt-1 text-sm text-slate-500">Open task pressure across deadlines, priority, and blockers.</p>
          </div>
          <span className="rounded-full border border-[#2e2e45] bg-[#22223a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8b8ba0]">
            Live API data
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {workloadMetrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-[#2e2e45] bg-[#1a1a24] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8b8ba0]">{metric.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${metric.accent}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Tasks by Status</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Tasks by Priority</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#8b8ba0" />
                <YAxis allowDecimals={false} stroke="#8b8ba0" />
                <Tooltip />
                <Bar dataKey="value">
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold text-white">Project Progress</h2>
        <div className="mt-4 space-y-3">
          {projectRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
              <p className="text-sm font-semibold text-slate-200">No projects yet</p>
              <p className="mt-1 text-xs text-slate-500">Create projects and tasks to populate progress analytics.</p>
            </div>
          ) : (
            projectRows.map((project) => (
              <div key={project.id} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{project.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{project.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-200">{project.completionRate}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${project.completionRate}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
