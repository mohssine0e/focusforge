import { useCallback, useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { notificationApi } from './api/notificationApi';
import CalendarPage from './pages/CalendarPage';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import KanbanOverviewPage from './pages/KanbanOverviewPage';
import KanbanPage from './pages/KanbanPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import WorkspacePage from './pages/WorkspacePage';
import type { AppNotification } from './types';

function App() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
      setNotificationError(null);
    } catch (err) {
      setNotificationError('Notifications unavailable');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, [loadNotifications]);

  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  const markNotificationRead = async (notificationId: number) => {
    try {
      const updated = await notificationApi.markAsRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId ? updated : notification
      )));
    } catch (err) {
      setNotificationError('Failed to mark notification as read');
      console.error(err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
    } catch (err) {
      setNotificationError('Failed to delete notification');
      console.error(err);
    }
  };

  const navigationItems = [
    { label: 'Dashboard', to: '/', end: true, icon: 'D' },
    { label: 'Workspaces', to: '/workspaces', icon: 'W' },
    { label: 'Projects', to: '/projects', icon: 'P' },
    { label: 'Kanban Board', to: '/kanban', icon: 'K' },
    { label: 'Calendar', to: '/calendar', icon: 'C' },
    { label: 'Focus Mode', to: '/focus', icon: 'F' },
    { label: 'Analytics', to: '/analytics', icon: 'A' },
  ];

  const notificationPanel = (
    <div className="absolute right-0 z-30 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-[#223047] bg-[#121a29] p-4 text-left shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#8b8ba0]">Latest notifications</h2>
        <button
          className="text-xs font-medium text-[#a78bfa] hover:text-[#c4b5fd]"
          onClick={loadNotifications}
          type="button"
        >
          Refresh
        </button>
      </div>

      {notificationError && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {notificationError}
        </p>
      )}

      <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#223047] p-5 text-center">
            <p className="text-sm font-semibold text-[#f0f0f5]">No notifications yet</p>
            <p className="mt-1 text-xs text-[#8b8ba0]">Task changes will appear here as they happen.</p>
          </div>
        ) : (
          notifications.slice(0, 6).map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-3 ${
                notification.read
                  ? 'border-[#223047] bg-[#0b1422]/70'
                  : 'border-[#8b5cf6]/40 bg-[#8b5cf6]/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#f0f0f5]">{notification.message}</p>
                  <p className="mt-1 text-xs text-[#55556a]">
                    {notification.type.replace('_', ' ')} - {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8b5cf6]" />
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-md border border-[#223047] px-2 py-1 text-xs text-[#f0f0f5] hover:bg-[#172238] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={notification.read}
                  onClick={() => markNotificationRead(notification.id)}
                  type="button"
                >
                  Mark read
                </button>
                <button
                  className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                  onClick={() => deleteNotification(notification.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="app min-h-screen bg-[#050d16] text-[#f0f0f5]">
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-56 flex-col rounded-l-[28px] border border-[#152236] bg-[#07111d]/95 lg:flex">
        <div className="flex h-20 items-center border-b border-[#152236] px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b5cf6]/20 text-sm font-bold text-[#a78bfa]">F</span>
            <h1 className="text-xl font-semibold text-white"><span className="text-[#a78bfa]">Focus</span>Forge</h1>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-3 py-5">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              end={item.end}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#8b5cf6]/20 text-white shadow-[0_14px_40px_rgba(139,92,246,0.16)]'
                    : 'text-[#a8b0c0] hover:bg-[#111c2e] hover:text-white'
                }`
              }
            >
              <span className="flex h-5 w-5 items-center justify-center text-xs text-[#a78bfa]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-[#a8b0c0] transition hover:bg-[#111c2e] hover:text-white"
            onClick={() => setNotificationsOpen((open) => !open)}
            type="button"
          >
            <span className="flex h-5 w-5 items-center justify-center text-xs text-[#a78bfa]">N</span>
            Notifications
            {unreadNotificationCount > 0 && (
              <span className="ml-2 rounded-full bg-[#8b5cf6] px-2 py-0.5 text-xs font-bold text-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </nav>
        <div className="m-3 rounded-xl border border-[#223047] bg-[#0d1728] p-4">
          <p className="text-sm font-semibold text-white">John Developer</p>
          <p className="mt-1 text-xs text-[#8a94a6]">Pro Plan</p>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-[#152236] bg-[#050d16]/95 backdrop-blur lg:left-[240px] lg:right-4 lg:top-4 lg:rounded-tr-[28px]">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="min-w-0 lg:hidden">
            <h1 className="text-lg font-semibold text-white">FocusForge</h1>
          </div>
          <div className="hidden flex-1 lg:block">
            <input
              className="h-9 w-full max-w-sm rounded-lg border border-[#223047] bg-[#07111d] px-3 text-sm text-[#f0f0f5] outline-none placeholder:text-[#69758a] focus:border-[#8b5cf6]"
              placeholder="Search projects, tasks, deadlines..."
              type="search"
            />
          </div>
          <div className="relative ml-auto">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#223047] bg-[#07111d] px-3 text-sm font-medium text-[#f0f0f5] hover:bg-[#111c2e]"
              onClick={() => setNotificationsOpen((open) => !open)}
              type="button"
            >
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="rounded-full bg-[#8b5cf6] px-2 py-0.5 text-xs font-bold text-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && notificationPanel}
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-[#152236] bg-[#07111d] px-3 py-2 lg:hidden">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              end={item.end}
              to={item.to}
              className={({ isActive }) =>
                `shrink-0 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-[#8b5cf6]/20 text-[#a78bfa]' : 'text-[#a8b0c0] hover:bg-[#111c2e] hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_28%),linear-gradient(135deg,#06111e_0%,#06101a_45%,#071523_100%)] pt-28 lg:ml-[240px] lg:mr-4 lg:mt-4 lg:rounded-r-[28px] lg:pt-14">
        <div className="p-4 lg:p-7">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<DashboardPage />} />
            <Route path="/workspaces" element={<WorkspacePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/kanban" element={<KanbanOverviewPage />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/kanban" element={<KanbanPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
