import { useState, useEffect } from 'react';
import './App.css';
import { healthApi } from './api/healthApi';
import WorkspacePage from './pages/WorkspacePage';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspaces'>('dashboard');
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthApi.getHealth();
        setHealthStatus(response.data);
        setIsLoading(false);
      } catch (error) {
        setHealthStatus('Backend connection failed');
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);

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
    <div className="app">
      <header className="app-header bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FocusForge</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Productivity and project management for engineering students and developers
          </p>
          <nav className="mt-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('workspaces')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Workspaces
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {currentView === 'dashboard' ? renderDashboard() : <WorkspacePage />}
        </div>
      </main>
    </div>
  );
}

export default App;