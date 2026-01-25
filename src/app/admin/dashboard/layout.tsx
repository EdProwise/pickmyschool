'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, MessageSquareQuote, Star, Building2, Settings, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/dashboard/testimonials', icon: MessageSquareQuote, label: 'Testimonials' },
  { href: '/admin/dashboard/spotlight', icon: Star, label: 'Spotlight' },
  { href: '/admin/dashboard/schools', icon: Building2, label: 'Schools' },
  { href: '/admin/dashboard/contact-submissions', icon: Mail, label: 'Contact Submissions' },
  { href: '/admin/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}