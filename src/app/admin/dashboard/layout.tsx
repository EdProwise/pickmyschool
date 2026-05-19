'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, MessageSquareQuote, Star, Building2, Settings, LogOut, Mail, Users, Database, BookOpen, Briefcase, Tag, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/dashboard/spotlight', icon: Star, label: 'Spotlight' },
  { href: '/admin/dashboard/schools', icon: Building2, label: 'Schools' },
  { href: '/admin/dashboard/freelancers', icon: Briefcase, label: 'Freelancers' },
  { href: '/admin/dashboard/users', icon: Database, label: 'User Database' },
  { href: '/admin/dashboard/blogs', icon: BookOpen, label: 'Blogs' },
  { href: '/admin/dashboard/contact-submissions', icon: Mail, label: 'Contact Submissions' },
  { href: '/admin/dashboard/admins', icon: Users, label: 'Manage Admins' },
  { href: '/admin/dashboard/testimonials', icon: MessageSquareQuote, label: 'Testimonials' },
  { href: '/admin/dashboard/gtm', icon: Tag, label: 'Google Tag Manager' },
  { href: '/admin/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface AdminNotification {
  _id: string;
  type: string;
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

const TYPE_ICON: Record<string, string> = {
  signup: '👤',
  contact_submission: '📩',
  default: '🔔',
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    fetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => { });
  }, [pathname]);

  const openNotif = async () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen && unreadCount > 0) {
      const token = localStorage.getItem('admin_token');
      if (!token) return;
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => { });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}>
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Admin Panel</h2>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' } : {}}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-end shrink-0 shadow-sm">
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

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="font-semibold text-slate-800 text-sm">Notifications</p>
                    {notifications.length > 0 && (
                      <span className="text-xs text-slate-400">{notifications.length} total</span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          className={`px-4 py-3 flex gap-3 ${n.isRead ? 'bg-white' : 'bg-cyan-50/60'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-sm">
                            {TYPE_ICON[n.type] || TYPE_ICON.default}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-cyan-500 rounded-full shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-slate-100 text-center">
                      <button
                        onClick={() => router.push('/admin/dashboard/contact-submissions')}
                        className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                      >
                        View Contact Submissions →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
