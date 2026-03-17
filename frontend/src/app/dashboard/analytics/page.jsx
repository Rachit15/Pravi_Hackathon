'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import { Users, FileText, CheckCircle, TrendingUp, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#3fb950', '#d29922', '#f85149', '#58a6ff', '#a78bfa', '#34d399'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-sm" style={{ border: '1px solid var(--border)' }}>
        <p className="font-medium text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(res => setStats(res.data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return <div style={{ color: 'var(--text-secondary)' }}>Failed to load analytics</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" /> System Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Real-time insights into the grievance redressal system</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Total Grievances" value={stats.totalGrievances} color="#6366f1" />
        <StatCard icon={Users} label="Total Citizens" value={stats.totalUsers} color="#58a6ff" />
        <StatCard icon={CheckCircle} label="Resolved This Month" value={stats.resolvedThisMonth} color="#3fb950" />
      </div>

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Grievances by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stats.statusBreakdown} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {stats.statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority breakdown */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Grievances by Priority</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.priorityBreakdown} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
              <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {stats.priorityBreakdown.map((entry, i) => {
                  const colors = { Low: '#3fb950', Medium: '#d29922', High: '#f85149', Critical: '#ff7b72' };
                  return <Cell key={i} fill={colors[entry.name] || '#6366f1'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly trend */}
      {stats.monthlyData?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Monthly Grievance Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.monthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
              <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Grievances" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Department breakdown */}
      {stats.departmentBreakdown?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Grievances by Department</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, stats.departmentBreakdown.length * 40)}>
            <BarChart data={stats.departmentBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
              <XAxis type="number" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Grievances" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent grievances */}
      {stats.recentGrievances?.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-white">Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Citizen</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentGrievances.map(g => (
                  <tr key={g._id}>
                    <td><span className="font-mono text-xs font-medium" style={{ color: '#818cf8' }}>{g.ticketId}</span></td>
                    <td className="font-medium text-white max-w-xs truncate">{g.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.userId?.name || 'Unknown'}</td>
                    <td><span className={`status-${g.status} px-2 py-0.5 rounded-full text-xs font-medium`}>{g.status?.replace('_', ' ').toUpperCase()}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }} className="text-xs">{new Date(g.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
