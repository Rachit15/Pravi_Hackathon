'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Search, Filter } from 'lucide-react';

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

export default function AssignedGrievancesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchGrievances();
  }, [statusFilter]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/grievances?${params}`);
      setGrievances(res.data.grievances || []);
    } catch (e) {} finally { setLoading(false); }
  };

  const statusOptions = ['', 'submitted', 'under_review', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assigned Grievances</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Manage and update grievances assigned to you</p>
        </div>
        <select className="input-field w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ cursor: 'pointer' }}>
          {statusOptions.map(s => <option key={s} value={s}>{s ? s.replace('_', ' ').toUpperCase() : 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />Loading...
          </div>
        ) : grievances.length === 0 ? (
          <div className="p-12 text-center">
            <p style={{ color: 'var(--text-secondary)' }}>No assigned grievances</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Citizen</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map(g => (
                  <tr key={g._id} onClick={() => router.push(`/dashboard/grievance/${g._id}`)} style={{ cursor: 'pointer' }}>
                    <td><span className="font-mono text-xs font-medium" style={{ color: '#818cf8' }}>{g.ticketId}</span></td>
                    <td className="font-medium text-white max-w-xs truncate">{g.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.userId?.name || 'Unknown'}</td>
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
