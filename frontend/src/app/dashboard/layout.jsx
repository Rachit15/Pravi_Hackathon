'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  FileText, Home, Plus, List, Bell, BarChart2,
  Building, LogOut, Menu, X, ChevronRight, User,
  Shield, Briefcase,
} from 'lucide-react';

const citizenNav = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/submit', icon: Plus, label: 'Submit Grievance' },
  { href: '/dashboard/my-grievances', icon: List, label: 'My Grievances' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const officerNav = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/assigned', icon: Briefcase, label: 'Assigned Grievances' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const adminNav = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/all-grievances', icon: List, label: 'All Grievances' },
  { href: '/dashboard/departments', icon: Building, label: 'Departments' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const roleNavMap = { citizen: citizenNav, officer: officerNav, admin: adminNav };
const roleIcons = { citizen: User, officer: Briefcase, admin: Shield };
const roleColors = { citizen: '#3fb950', officer: '#58a6ff', admin: '#d29922' };

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, router]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  if (!user) return null;

  const navItems = roleNavMap[user.role] || citizenNav;
  const RoleIcon = roleIcons[user.role] || User;
  const roleColor = roleColors[user.role] || '#8b949e';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative"
        style={{
          background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
          color: isActive ? '#818cf8' : 'var(--text-secondary)',
          borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
        }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-sm">{item.label}</span>
        {item.href === '/dashboard/notifications' && unreadCount > 0 && (
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#6366f1', color: 'white' }}>{unreadCount}</span>
        )}
        {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm leading-tight">Grievance</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Redressal System</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: `${roleColor}22`, color: roleColor }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user.name}</p>
            <div className="flex items-center gap-1">
              <RoleIcon className="w-3 h-3" style={{ color: roleColor }} />
              <p className="text-xs capitalize" style={{ color: roleColor }}>{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,81,73,0.1)'; e.currentTarget.style.color = '#f85149'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-white">Grievance Portal</span>
          <div className="w-5" />
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
