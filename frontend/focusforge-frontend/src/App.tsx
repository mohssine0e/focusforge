import { useCallback, useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { healthApi } from './api/healthApi';
import { notificationApi } from './api/notificationApi';
import FocusPage from './pages/FocusPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import WorkspacePage from './pages/WorkspacePage';
import type { AppNotification } from './types';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    const checkHealth = async () => {
      try {
        const response = await healthApi.getHealth();
        setHealthStatus(response.data);
        setIsLoading(false);
      } catch {
        setHealthStatus('Backend connection failed');
        setIsLoading(false);
      }
    };

    checkHealth();
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

  const renderDashboard = () => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg p-6">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backend Status</h3>
          <div className="mt-2">
            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-300">Checking backend connection...</p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">{healthStatus}</p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 mt-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Manage your projects and track progress
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Organize and prioritize your tasks
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Focus Sessions</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Track your productivity with Pomodoro timers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app min-h-screen bg-slate-950 text-slate-100">
      <header className="app-header border-b border-slate-800 bg-slate-950/95 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">FocusForge</h1>
              <p className="text-lg text-slate-400">
                Productivity and project management for engineering students and developers
              </p>
            </div>
            <div className="relative">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                onClick={() => setNotificationsOpen((open) => !open)}
                type="button"
              >
                Notifications
                {unreadNotificationCount > 0 && (
                  <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-bold text-slate-950">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 z-20 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-800 bg-slate-950 p-4 text-left shadow-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Latest notifications</h2>
                    <button
                      className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
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
                      <div className="rounded-lg border border-dashed border-slate-700 p-5 text-center">
                        <p className="text-sm font-semibold text-slate-200">No notifications yet</p>
                        <p className="mt-1 text-xs text-slate-500">Task changes will appear here as they happen.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-lg border p-3 ${
                            notification.read
                              ? 'border-slate-800 bg-slate-900/70'
                              : 'border-cyan-400/30 bg-cyan-400/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-100">{notification.message}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {notification.type.replace('_', ' ')} - {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                            )}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              )}
            </div>
          </div>
          <nav className="mt-4 flex gap-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/workspaces"
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`
              }
            >
              Workspaces
            </NavLink>
            <NavLink
              to="/focus"
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`
              }
            >
              Focus Mode
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main-content py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={renderDashboard()} />
            <Route path="/workspaces" element={<WorkspacePage />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
