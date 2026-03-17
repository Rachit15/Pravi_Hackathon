'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Building, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', head: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.departments || []);
    } catch (e) {} finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setFormData({ name: '', description: '', head: '' }); setShowForm(true); setError(''); };
  const openEdit = (dept) => { setEditing(dept); setFormData({ name: dept.name, description: dept.description || '', head: dept.head || '' }); setShowForm(true); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-400" /> Departments
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Manage government departments for grievance classification</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="glass-card p-6 w-full max-w-md relative animate-fade-in" style={{ zIndex: 1 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">{editing ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Department Name *</label>
                <input type="text" className="input-field" placeholder="e.g. Electricity" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Department description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Department Head</label>
                <input type="text" className="input-field" placeholder="Name of head of department" value={formData.head} onChange={e => setFormData({ ...formData, head: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments grid */}
      {loading ? (
        <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />Loading...
        </div>
      ) : departments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Building className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No departments yet. Add the first one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept._id} className="glass-card p-5 group hover:border-indigo-500/40 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Building className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-400" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400" title="Deactivate">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">{dept.name}</h3>
              {dept.description && <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{dept.description}</p>}
              {dept.head && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Head: <span className="text-white">{dept.head}</span></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
