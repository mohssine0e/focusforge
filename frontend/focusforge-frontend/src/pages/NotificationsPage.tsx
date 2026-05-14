import React, { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import type { AppNotification } from '../types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setNotifications(await notificationApi.getNotifications());
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (id: number) => {
    const updated = await notificationApi.markAsRead(id);
    setNotifications((current) => current.map((item) => (item.id === id ? updated : item)));
  };

  const remove = async (id: number) => {
    await notificationApi.deleteNotification(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-[#141d2d]" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl border border-[#223047] bg-[#121a29]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          <p className="mt-2 text-sm text-[#8a94a6]">Task updates, blockers, completion events, and deadline warnings.</p>
        </div>
        <button className="rounded-lg border border-[#223047] bg-[#121a29] px-4 py-2 text-sm text-[#c5cbd8] hover:bg-[#172238]" onClick={loadNotifications} type="button">
          Refresh
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#223047] bg-[#121a29] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#223047] bg-[#172238] text-xs font-bold text-[#a78bfa]">NT</div>
          <h2 className="mt-3 text-sm font-semibold text-white">No notifications yet</h2>
          <p className="mt-1 text-xs text-[#8a94a6]">Task workflow changes will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article key={notification.id} className={`rounded-xl border p-4 ${notification.read ? 'border-[#223047] bg-[#121a29]' : 'border-[#8b5cf6]/40 bg-[#8b5cf6]/10'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{notification.message}</p>
                  <p className="mt-1 text-xs text-[#8a94a6]">{notification.type.replace('_', ' ')} - {new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-[#223047] px-3 py-2 text-xs text-[#c5cbd8] disabled:opacity-50" disabled={notification.read} onClick={() => markRead(notification.id)} type="button">
                    Mark read
                  </button>
                  <button className="rounded-lg border border-red-500/40 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10" onClick={() => remove(notification.id)} type="button">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
