'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Send, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const CATEGORIES = ['Infrastructure', 'Electricity', 'Water', 'Roads', 'Sanitation', 'Healthcare', 'Education', 'Public Safety', 'Environment', 'Other'];

export default function SubmitGrievancePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', description: '', category: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/grievances', formData);
      setSuccess(res.data.grievance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-96">
        <div className="glass-card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(63, 185, 80, 0.15)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#3fb950' }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Grievance Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Your grievance has been submitted successfully.</p>
          <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--surface-2)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Ticket ID</p>
            <p className="font-mono text-xl font-bold" style={{ color: '#818cf8' }}>{success.ticketId}</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg mb-6" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <p className="text-xs text-indigo-300">AI classification is in progress. Department and priority will be automatically assigned.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard/my-grievances')} className="btn-primary flex-1">View My Grievances</button>
            <button onClick={() => { setSuccess(null); setFormData({ title: '', description: '', category: '' }); }} className="btn-secondary flex-1">Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Submit a Grievance</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Describe your issue and our AI will classify it automatically</p>
      </div>

      <div className="glass-card p-8">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-6 text-sm" style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Title <span style={{ color: '#f85149' }}>*</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="Brief, descriptive title of your grievance"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={200}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{formData.title.length}/200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Category <span style={{ color: '#f85149' }}>*</span></label>
            <select
              className="input-field"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              required
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description <span style={{ color: '#f85149' }}>*</span></label>
            <textarea
              className="input-field resize-none"
              rows={6}
              placeholder="Please describe your grievance in detail. Include location, date, and any relevant information..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
              maxLength={5000}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{formData.description.length}/5000 characters</p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <p className="text-xs text-indigo-300">AI will automatically classify the department and priority based on your description.</p>
          </div>

          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Grievance</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
