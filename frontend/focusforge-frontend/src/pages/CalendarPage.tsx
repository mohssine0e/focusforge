import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskApi } from '../api/taskApi';
import type { Priority, Task, TaskStatusType } from '../types';

const statusClasses: Record<TaskStatusType, string> = {
  TODO: 'border-[#55556a] bg-[#55556a]/15 text-[#c7c7d6]',
  IN_PROGRESS: 'border-[#7c6ef7] bg-[#7c6ef7]/15 text-[#bdb7ff]',
  BLOCKED: 'border-[#e05555] bg-[#e05555]/15 text-[#ffb7b7]',
  REVIEW: 'border-[#f0a500] bg-[#f0a500]/15 text-[#ffd27a]',
  DONE: 'border-[#22c55e] bg-[#22c55e]/15 text-[#86efac]',
};

const priorityClasses: Record<Priority, string> = {
  LOW: 'bg-[#55556a]/20 text-[#b8b8c8]',
  MEDIUM: 'bg-[#f0a500]/20 text-[#ffd27a]',
  HIGH: 'bg-[#e07855]/20 text-[#ffb092]',
  URGENT: 'bg-[#e05555]/20 text-[#ffb7b7]',
};

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const monthLabel = (date: Date) => date.toLocaleDateString(undefined, {
  month: 'long',
  year: 'numeric',
});

const CalendarPage: React.FC = () => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthBounds = useMemo(() => {
    const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    return { start, end };
  }, [visibleMonth]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(monthBounds.start);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      return date;
    });
  }, [monthBounds]);

  const tasksByDate = useMemo(() => (
    tasks.reduce<Record<string, Task[]>>((grouped, task) => {
      if (!task.dueDate) {
        return grouped;
      }

      const dueDateKey = task.dueDate.slice(0, 10);
      grouped[dueDateKey] = [...(grouped[dueDateKey] ?? []), task];
      return grouped;
    }, {})
  ), [tasks]);

  const loadCalendarTasks = useCallback(async () => {
    try {
      setLoading(true);
      const dueTasks = await taskApi.getDueTasks({
        from: formatDateParam(monthBounds.start),
        to: formatDateParam(monthBounds.end),
      });
      setTasks(dueTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load calendar tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [monthBounds]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCalendarTasks();
  }, [loadCalendarTasks]);

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Calendar</h1>
          <p className="mt-2 text-sm text-slate-400">
            Plan deadlines by month and jump back into the project behind each task.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-[#2e2e45] bg-[#1a1a24] px-3 py-2 text-sm font-medium text-[#f0f0f5] hover:bg-[#22223a]"
            onClick={() => moveMonth(-1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-md border border-[#7c6ef7] bg-[#7c6ef7]/20 px-3 py-2 text-sm font-medium text-[#bdb7ff] hover:bg-[#7c6ef7]/30"
            onClick={goToToday}
            type="button"
          >
            Today
          </button>
          <button
            className="rounded-md border border-[#2e2e45] bg-[#1a1a24] px-3 py-2 text-sm font-medium text-[#f0f0f5] hover:bg-[#22223a]"
            onClick={() => moveMonth(1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">{monthLabel(visibleMonth)}</h2>
          <span className="rounded-full border border-[#2e2e45] bg-[#22223a] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8b8ba0]">
            {tasks.length} due tasks
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-[#2e2e45]">
            <div className="grid min-w-[860px] grid-cols-7 gap-px bg-[#2e2e45]">
              {Array.from({ length: 42 }, (_, index) => (
                <div key={index} className="min-h-28 animate-pulse bg-[#22223a] p-3" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-[#2e2e45]">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-7 border-b border-[#2e2e45] bg-[#22223a]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#8b8ba0]">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-[#2e2e45]">
                {calendarDays.map((date) => {
                  const dateKey = formatDateParam(date);
                  const dayTasks = tasksByDate[dateKey] ?? [];
                  const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                  const isToday = dateKey === formatDateParam(new Date());

                  return (
                    <div
                      key={dateKey}
                      className={`min-h-40 bg-[#1a1a24] p-3 ${isCurrentMonth ? '' : 'opacity-45'}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday ? 'bg-[#7c6ef7]/20 text-[#bdb7ff]' : 'text-[#f0f0f5]'
                        }`}>
                          {date.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="rounded-full bg-[#7c6ef7]/20 px-2 py-0.5 text-xs font-semibold text-[#bdb7ff]">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {dayTasks.map((task) => (
                          <Link
                            key={task.id}
                            className="block rounded-lg border border-[#2e2e45] bg-[#22223a] p-2 hover:border-[#7c6ef7]/70"
                            to={`/projects/${task.projectId}`}
                          >
                            <p className="line-clamp-2 text-xs font-semibold text-white">{task.title}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClasses[task.status]}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityClasses[task.priority]}`}>
                                {task.priority}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-[#2e2e45] bg-[#0f0f13] p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2e2e45] bg-[#22223a] text-xs font-bold text-[#7c6ef7]">
              CAL
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">No due tasks yet</h3>
            <p className="mt-1 max-w-md text-xs text-[#8b8ba0]">
              Tasks with due dates in this month will appear here for planning.
            </p>
            <Link
              className="mt-4 rounded-md bg-[#7c6ef7] px-3 py-2 text-sm font-semibold text-white hover:bg-[#6c5ee0]"
              to="/workspaces"
            >
              Open workspaces
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default CalendarPage;
