export function HomePage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Welcome to FocusForge - Your productivity and project management platform
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
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
      </div>
    </div>
  );
}