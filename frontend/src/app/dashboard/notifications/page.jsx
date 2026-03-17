'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Bell, BellOff, Check, CheckCheck } from 'lucide-react';

const typeColors = {
  grievance_submitted: '#3fb950',
  officer_assigned: '#58a6ff',
  status_updated: '#d29922',
  grievance_resolved: '#818cf8',
  general: '#8b949e',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {} finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {notifications.map(n => (
              <div
                key={n._id}
                className="flex items-start gap-4 p-4 transition-all duration-200"
                style={{ background: n.read ? 'transparent' : 'rgba(99,102,241,0.05)' }}
              >
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: n.read ? 'transparent' : typeColors[n.type] || '#6366f1' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <button onClick={() => markRead(n._id)} className="flex-shrink-0 p-1 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
