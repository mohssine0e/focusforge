import { useCallback, useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { authApi } from './api/authApi';
import { notificationApi } from './api/notificationApi';
import { projectApi } from './api/projectApi';
import { taskApi } from './api/taskApi';
import { workspaceApi } from './api/workspaceApi';
import AuthPage from './pages/AuthPage';
import CalendarPage from './pages/CalendarPage';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import KanbanOverviewPage from './pages/KanbanOverviewPage';
import KanbanPage from './pages/KanbanPage';
import NotificationsPage from './pages/NotificationsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import WorkspaceDetailPage from './pages/WorkspaceDetailPage';
import WorkspacePage from './pages/WorkspacePage';
import type { AppNotification, AppUser, AuthResponse } from './types';

interface SearchResult {
  label: string;
  meta: string;
  to: string;
}

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(window.localStorage.getItem('focusforge_token')));
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

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
    const token = window.localStorage.getItem('focusforge_token');
    if (!token) {
      return;
    }

    authApi.me()
      .then(setUser)
      .catch(() => window.localStorage.removeItem('focusforge_token'))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadNotifications();
    }
  }, [loadNotifications, user]);

  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!user || searchQuery.trim().length < 2) {
      return;
    }

    let cancelled = false;
    const query = searchQuery.trim().toLowerCase();
    const timeoutId = window.setTimeout(async () => {
      try {
        const workspaces = await workspaceApi.getWorkspaces();
        const projectGroups = await Promise.all(
          workspaces.map(async (workspace) => {
            const projects = await projectApi.getProjects(workspace.id);
            return Promise.all(projects.map(async (project) => {
              const tasks = await taskApi.getTasksByProject(project.id);
              return { workspace, project, tasks };
            }));
          })
        );

        const results: SearchResult[] = [];
        workspaces.forEach((workspace) => {
          if (workspace.name.toLowerCase().includes(query)) {
            results.push({ label: workspace.name, meta: 'Workspace', to: `/workspaces/${workspace.id}` });
          }
        });
        projectGroups.flat().forEach(({ workspace, project, tasks }) => {
          if (project.name.toLowerCase().includes(query)) {
            results.push({ label: project.name, meta: `Project in ${workspace.name}`, to: `/projects/${project.id}` });
          }
          tasks.forEach((task) => {
            if (task.title.toLowerCase().includes(query)) {
              results.push({ label: task.title, meta: `Task in ${project.name}`, to: `/projects/${project.id}` });
            }
          });
        });

        if (!cancelled) {
          setSearchResults(results.slice(0, 8));
          setSearchOpen(true);
        }
      } catch (err) {
        console.error(err);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, user]);

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
    { label: 'Notifications', to: '/notifications', icon: 'N' },
  ];

  const handleAuthenticated = (auth: AuthResponse) => {
    window.localStorage.setItem('focusforge_token', auth.token);
    setUser(auth.user);
  };

  const logout = () => {
    window.localStorage.removeItem('focusforge_token');
    setUser(null);
    setNotifications([]);
    setNotificationsOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050d16] text-sm text-[#8a94a6]">
        Loading FocusForge...
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

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
        </nav>
        <div className="m-3 rounded-xl border border-[#223047] bg-[#0d1728] p-4">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="mt-1 truncate text-xs text-[#8a94a6]">{user.email}</p>
          <button className="mt-3 text-xs font-semibold text-[#a78bfa] hover:text-[#c4b5fd]" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-20 border-b border-[#152236] bg-[#050d16]/95 backdrop-blur lg:left-[240px] lg:right-4 lg:top-4 lg:rounded-tr-[28px]">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="min-w-0 lg:hidden">
            <h1 className="text-lg font-semibold text-white">FocusForge</h1>
          </div>
          <div className="relative hidden flex-1 lg:block">
            <input
              className="h-9 w-full max-w-sm rounded-lg border border-[#223047] bg-[#07111d] px-3 text-sm text-[#f0f0f5] outline-none placeholder:text-[#69758a] focus:border-[#8b5cf6]"
              placeholder="Search projects, tasks, deadlines..."
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                if (event.target.value.trim().length < 2) {
                  setSearchResults([]);
                  setSearchOpen(false);
                }
              }}
              onFocus={() => setSearchOpen(true)}
            />
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 z-30 mt-2 w-full max-w-sm rounded-xl border border-[#223047] bg-[#121a29] p-2 shadow-2xl">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-[#8a94a6]">No matching work found.</p>
                ) : (
                  searchResults.map((result) => (
                    <NavLink
                      key={`${result.to}-${result.label}`}
                      className="block rounded-lg px-3 py-2 hover:bg-[#172238]"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      to={result.to}
                    >
                      <span className="block truncate text-sm font-semibold text-white">{result.label}</span>
                      <span className="mt-0.5 block text-xs text-[#8a94a6]">{result.meta}</span>
                    </NavLink>
                  ))
                )}
              </div>
            )}
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
            <Route path="/" element={<DashboardPage userName={user.name} />} />
            <Route path="/analytics" element={<DashboardPage userName={user.name} analyticsMode />} />
            <Route path="/workspaces" element={<WorkspacePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/kanban" element={<KanbanOverviewPage />} />
            <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/kanban" element={<KanbanPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
