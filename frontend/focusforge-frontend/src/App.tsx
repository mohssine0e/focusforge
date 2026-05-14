import { useCallback, useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { notificationApi } from './api/notificationApi';
import CalendarPage from './pages/CalendarPage';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import KanbanPage from './pages/KanbanPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
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
    { label: 'Dashboard', to: '/', end: true },
    { label: 'Workspaces', to: '/workspaces' },
    { label: 'Projects', to: '/projects' },
    { label: 'Kanban Board', to: '/kanban' },
    { label: 'Calendar', to: '/calendar' },
    { label: 'Focus Mode', to: '/focus' },
    { label: 'Analytics', to: '/analytics' },
  ];

  const notificationPanel = (
    <div className="absolute right-0 z-30 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-[#2e2e45] bg-[#1a1a24] p-4 text-left shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#8b8ba0]">Latest notifications</h2>
        <button
          className="text-xs font-medium text-[#7c6ef7] hover:text-[#bdb7ff]"
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
          <div className="rounded-lg border border-dashed border-[#2e2e45] p-5 text-center">
            <p className="text-sm font-semibold text-[#f0f0f5]">No notifications yet</p>
            <p className="mt-1 text-xs text-[#8b8ba0]">Task changes will appear here as they happen.</p>
          </div>
        ) : (
          notifications.slice(0, 6).map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-3 ${
                notification.read
                  ? 'border-[#2e2e45] bg-[#22223a]/70'
                  : 'border-[#7c6ef7]/40 bg-[#7c6ef7]/10'
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
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#7c6ef7]" />
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-md border border-[#2e2e45] px-2 py-1 text-xs text-[#f0f0f5] hover:bg-[#22223a] disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="app min-h-screen bg-[#0f0f13] text-[#f0f0f5]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[#2e2e45] bg-[#1a1a24] lg:flex">
        <div className="flex h-16 items-center border-b border-[#2e2e45] px-5">
          <div>
            <h1 className="text-xl font-semibold text-white">FocusForge</h1>
            <p className="text-xs text-[#8b8ba0]">Engineering workspace</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              end={item.end}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-r-lg border-l-2 px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-[#7c6ef7] bg-[#7c6ef7]/20 text-[#7c6ef7]'
                    : 'border-transparent text-[#8b8ba0] hover:bg-[#22223a] hover:text-[#f0f0f5]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            className="block w-full rounded-r-lg border-l-2 border-transparent px-3 py-2 text-left text-sm font-medium text-[#8b8ba0] transition hover:bg-[#22223a] hover:text-[#f0f0f5]"
            onClick={() => setNotificationsOpen((open) => !open)}
            type="button"
          >
            Notifications
            {unreadNotificationCount > 0 && (
              <span className="ml-2 rounded-full bg-[#7c6ef7] px-2 py-0.5 text-xs font-bold text-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </nav>
        <div className="border-t border-[#2e2e45] p-4">
          <p className="text-sm font-semibold text-white">Solo workspace</p>
          <p className="mt-1 text-xs text-[#8b8ba0]">Projects, study, deadlines, focus.</p>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-[#2e2e45] bg-[#0f0f13]/95 backdrop-blur lg:left-60">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="min-w-0 lg:hidden">
            <h1 className="text-lg font-semibold text-white">FocusForge</h1>
          </div>
          <div className="hidden flex-1 lg:block">
            <input
              className="h-9 w-full max-w-xl rounded-lg border border-[#2e2e45] bg-[#1a1a24] px-3 text-sm text-[#f0f0f5] outline-none placeholder:text-[#55556a] focus:border-[#7c6ef7]"
              placeholder="Search projects, tasks, deadlines..."
              type="search"
            />
          </div>
          <div className="relative ml-auto">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2e2e45] bg-[#1a1a24] px-3 text-sm font-medium text-[#f0f0f5] hover:bg-[#22223a]"
              onClick={() => setNotificationsOpen((open) => !open)}
              type="button"
            >
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="rounded-full bg-[#7c6ef7] px-2 py-0.5 text-xs font-bold text-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && notificationPanel}
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-[#2e2e45] bg-[#1a1a24] px-3 py-2 lg:hidden">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              end={item.end}
              to={item.to}
              className={({ isActive }) =>
                `shrink-0 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-[#7c6ef7]/20 text-[#7c6ef7]' : 'text-[#8b8ba0] hover:bg-[#22223a] hover:text-[#f0f0f5]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-h-screen pt-28 lg:pl-60 lg:pt-14">
        <div className="p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<DashboardPage />} />
            <Route path="/workspaces" element={<WorkspacePage />} />
            <Route path="/projects" element={<Navigate to="/workspaces" replace />} />
            <Route path="/kanban" element={<Navigate to="/workspaces" replace />} />
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
