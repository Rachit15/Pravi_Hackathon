'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Clock, User, Building, AlertTriangle, MessageSquare, Send } from 'lucide-react';

const StatusBadge = ({ status }) => (
  <span className={`status-${status} px-3 py-1 rounded-full text-sm font-medium`}>
    {status?.replace('_', ' ').toUpperCase()}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span className={`priority-${priority} px-3 py-1 rounded-full text-sm font-medium`}>
    {priority}
  </span>
);

export default function GrievanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [grievance, setGrievance] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchGrievance();
  }, [id]);

  const fetchGrievance = async () => {
    try {
      const res = await api.get(`/grievances/${id}`);
      setGrievance(res.data.grievance);
      setUpdates(res.data.updates || []);
      setNewStatus(res.data.grievance.status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/grievances/${id}/status`, { status: newStatus, resolution });
      await fetchGrievance();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateMessage.trim()) return;
    setSaving(true);
    try {
      await api.post(`/grievances/${id}/update`, { message: updateMessage });
      setUpdateMessage('');
      await fetchGrievance();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!grievance) return <div style={{ color: 'var(--text-secondary)' }}>Grievance not found</div>;

  const statusOptions = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{grievance.title}</h1>
          <p className="font-mono text-sm mt-1" style={{ color: '#818cf8' }}>{grievance.ticketId}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-3">Description</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{grievance.description}</p>
          </div>

          {/* Resolution */}
          {grievance.resolution && (
            <div className="glass-card p-6" style={{ borderColor: 'rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.05)' }}>
              <h2 className="font-semibold mb-3" style={{ color: '#3fb950' }}>Resolution</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{grievance.resolution}</p>
            </div>
          )}

          {/* Officer/Admin update form */}
          {(user?.role === 'officer' || user?.role === 'admin') && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-white">Update Grievance</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ cursor: 'pointer' }}>
                    {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              {(newStatus === 'resolved' || newStatus === 'closed') && (
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Resolution Note</label>
                  <textarea className="input-field resize-none" rows={3} placeholder="Describe the resolution..." value={resolution} onChange={e => setResolution(e.target.value)} />
                </div>
              )}
              <button onClick={handleStatusUpdate} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          )}

          {/* Updates timeline */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Updates Timeline
            </h2>
            {updates.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {updates.map((u, i) => (
                  <div key={u._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                        {u.updatedBy?.name?.charAt(0) || 'S'}
                      </div>
                      {i < updates.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: 'var(--border)' }} />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-white">{u.updatedBy?.name || 'System'}</span>
                        <span className="text-xs capitalize px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>{u.updatedBy?.role || 'system'}</span>
                        <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>{new Date(u.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add update (officer/admin) */}
            {(user?.role === 'officer' || user?.role === 'admin') && (
              <div className="mt-4 pt-4 border-t flex gap-3" style={{ borderColor: 'var(--border)' }}>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Add an update message..."
                  value={updateMessage}
                  onChange={e => setUpdateMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddUpdate()}
                />
                <button onClick={handleAddUpdate} disabled={saving || !updateMessage.trim()} className="btn-primary px-4">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-semibold text-white text-sm">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Status</p>
                <StatusBadge status={grievance.status} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Priority</p>
                <PriorityBadge priority={grievance.priority} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Category</p>
                <p className="text-sm text-white">{grievance.category}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Department</p>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-sm text-white">{grievance.department}</p>
                </div>
              </div>
              {grievance.assignedOfficer && (
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Assigned Officer</p>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm text-white">{grievance.assignedOfficer.name}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Submitted by</p>
                <p className="text-sm text-white">{grievance.userId?.name}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Submitted on</p>
                <p className="text-sm text-white">{new Date(grievance.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Last updated</p>
                <p className="text-sm text-white">{new Date(grievance.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              {grievance.aiClassified && (
                <div className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  <span className="animate-pulse-dot">✦</span> AI Classified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
