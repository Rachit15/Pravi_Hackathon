'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FileText, Clock, CheckCircle, AlertCircle, Plus, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

const StatusBadge = ({ status }) => (
  <span className={`status-${status} px-2 py-0.5 rounded-full text-xs font-medium`}>
    {status?.replace('_', ' ').toUpperCase()}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span className={`priority-${priority} px-2 py-0.5 rounded-full text-xs font-medium`}>
    {priority}
  </span>
);

const StatCard = ({ icon: Icon, label, value, color, href }) => (
  <Link href={href || '#'} className="glass-card p-6 flex items-center gap-4 hover:border-indigo-500/40 transition-all duration-200 group cursor-pointer">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/grievances?limit=5');
      setGrievances(res.data.grievances || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: grievances.length,
    submitted: grievances.filter(g => g.status === 'submitted').length,
    inProgress: grievances.filter(g => ['under_review', 'in_progress'].includes(g.status)).length,
    resolved: grievances.filter(g => g.status === 'resolved').length,
  };

  const roleLabel = { citizen: 'Citizen', officer: 'Officer', admin: 'Administrator' };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            {roleLabel[user?.role]} Dashboard • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {user?.role === 'citizen' && (
          <Link href="/dashboard/submit" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Grievance
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Grievances" value={stats.total} color="#6366f1" href="/dashboard/my-grievances" />
        <StatCard icon={Clock} label="Submitted" value={stats.submitted} color="#58a6ff" />
        <StatCard icon={Activity} label="In Progress" value={stats.inProgress} color="#d29922" />
        <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="#3fb950" />
      </div>

      {/* Recent grievances */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Recent Grievances
          </h2>
          <Link href={user?.role === 'citizen' ? '/dashboard/my-grievances' : '/dashboard/assigned'} className="text-xs text-indigo-400 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : grievances.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No grievances yet</p>
            {user?.role === 'citizen' && (
              <Link href="/dashboard/submit" className="btn-primary inline-block mt-4">Submit First Grievance</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map(g => (
                  <tr key={g._id} onClick={() => router.push(`/dashboard/grievance/${g._id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="font-mono text-xs font-medium" style={{ color: '#818cf8' }}>{g.ticketId}</span>
                    </td>
                    <td className="font-medium text-white max-w-xs truncate">{g.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.category}</td>
                    <td><PriorityBadge priority={g.priority} /></td>
                    <td><StatusBadge status={g.status} /></td>
                    <td style={{ color: 'var(--text-secondary)' }} className="text-xs">{new Date(g.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
