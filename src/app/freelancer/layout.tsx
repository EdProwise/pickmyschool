'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, PlusCircle, ListChecks, Wallet,
  Gift, Settings, LogOut, Briefcase, Menu, X, School, FileText, Bell,
} from 'lucide-react';
import { toast } from 'sonner';

const NAV = [
  { href: '/freelancer/dashboard',      label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/freelancer/list-of-school', label: 'List of School',      icon: School },
  { href: '/freelancer/generate-lead',  label: 'Generate Lead',       icon: PlusCircle },
  { href: '/freelancer/track-lead',     label: 'Track Lead',          icon: ListChecks },
  { href: '/freelancer/earning',                label: 'Earning',                icon: Wallet },
  { href: '/freelancer/statement-of-account',   label: 'Statement of Account',   icon: FileText },
  { href: '/freelancer/refer-earn',             label: 'Refer & Earn Policy',    icon: Gift },
  { href: '/freelancer/settings',       label: 'Settings',            icon: Settings },
];

const AUTH_PATHS = ['/freelancer/login', '/freelancer/register', '/freelancer/verify-email'];

interface Notification {
  _id: string;
  type: 'lead_status' | 'payment';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', totalEarnings: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isAuth = AUTH_PATHS.includes(pathname ?? '');

  // Close notif dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (isAuth) return;
    try {
      const d = JSON.parse(localStorage.getItem('freelancer_data') || '{}');
      setUser({ name: d.name || '', email: d.email || '', totalEarnings: d.totalEarnings || 0 });
    } catch { /* empty */ }

    const token = localStorage.getItem('freelancer_token');
    if (!token) return;

    fetch('/api/freelancer/statement', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        const totalEarned = (data.conversions || []).reduce((sum: number, c: { earned: number }) => sum + c.earned, 0);
        setUser(prev => ({ ...prev, totalEarnings: totalEarned }));
      })
      .catch(() => { /* keep stored value */ });

    // Fetch notifications
    fetch('/api/freelancer/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => { });
  }, [pathname, isAuth]);

  if (isAuth) return <>{children}</>;

  const logout = () => {
    localStorage.removeItem('freelancer_token');
    localStorage.removeItem('freelancer_data');
    toast.success('Logged out successfully');
    router.push('/freelancer/login');
  };

  const openNotif = async () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen && unreadCount > 0) {
      const token = localStorage.getItem('freelancer_token');
      if (!token) return;
      // Mark all as read
      await fetch('/api/freelancer/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => { });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">PickMySchool</p>
              <p className="text-xs text-slate-500">Freelancer Portal</p>
            </div>
          </div>
        </div>

        {/* User info */}
        {user.name && (
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon
                  style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, color: active ? '#059669' : '#94a3b8' }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
            <h1 className="font-semibold text-slate-800 text-sm">
              {NAV.find(n => n.href === pathname)?.label || 'Freelancer Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-500">Earning:</span>
              <span className="text-sm font-bold text-emerald-700">₹{user.totalEarnings.toLocaleString()}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={openNotif}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-semibold text-slate-800 text-sm">Notifications</p>
                    {notifications.length > 0 && (
                      <span className="text-xs text-slate-400">{notifications.length} total</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          className={`px-4 py-3 flex gap-3 ${n.isRead ? 'bg-white' : 'bg-emerald-50/60'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'payment' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            {n.type === 'payment' ? (
                              <span className="text-sm">💰</span>
                            ) : (
                              <span className="text-sm">📋</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
