'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, PlusCircle, ListChecks, Wallet,
  Gift, Settings, LogOut, Briefcase, Menu, X, School, FileText,
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

const AUTH_PATHS = ['/freelancer/login', '/freelancer/register'];

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', totalEarnings: 0 });

  const isAuth = AUTH_PATHS.includes(pathname ?? '');

  useEffect(() => {
    if (isAuth) return;
    try {
      const d = JSON.parse(localStorage.getItem('freelancer_data') || '{}');
      setUser({ name: d.name || '', email: d.email || '', totalEarnings: d.totalEarnings || 0 });
    } catch { /* empty */ }
  }, [pathname, isAuth]);

  if (isAuth) return <>{children}</>;

  const logout = () => {
    localStorage.removeItem('freelancer_token');
    localStorage.removeItem('freelancer_data');
    toast.success('Logged out successfully');
    router.push('/freelancer/login');
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
