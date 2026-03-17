'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function MyGrievancesPage() {
  const router = useRouter();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchGrievances();
  }, [page, statusFilter]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await api.get(`/grievances?${params}`);
      setGrievances(res.data.grievances || []);
      setPagination(res.data.pagination || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGrievances();
  };

  const statuses = ['', 'submitted', 'under_review', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Grievances</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Track and manage all your submitted grievances</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by title or ticket ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary px-4">Search</button>
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <select
            className="input-field pl-10 w-44"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            {statuses.filter(Boolean).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading grievances...
          </div>
        ) : grievances.length === 0 ? (
          <div className="p-12 text-center">
            <p style={{ color: 'var(--text-secondary)' }}>No grievances found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Department</th>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{g.category}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.department}</td>
                    <td><PriorityBadge priority={g.priority} /></td>
                    <td><StatusBadge status={g.status} /></td>
                    <td style={{ color: 'var(--text-secondary)' }} className="text-xs">{new Date(g.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-3 py-2">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
