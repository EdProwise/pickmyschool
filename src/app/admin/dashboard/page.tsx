'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, MessageSquareQuote, Star, TrendingUp, Eye } from 'lucide-react';

interface DashboardStats {
  totalSchools: number;
  totalTestimonials: number;
  featuredTestimonials: number;
  spotlightSchool: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalTestimonials: 0,
    featuredTestimonials: 0,
    spotlightSchool: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      setLoading(true);

      const [schoolsRes, testimonialsRes, spotlightRes] = await Promise.all([
        fetch('/api/admin/schools?limit=1000', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/testimonials', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/settings/spotlight', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const schoolsData = schoolsRes.ok ? await schoolsRes.json() : [];
      const testimonialsData = testimonialsRes.ok ? await testimonialsRes.json() : [];
      const spotlightData = spotlightRes.ok ? await spotlightRes.json() : null;

      setStats({
        totalSchools: schoolsData.length || 0,
        totalTestimonials: testimonialsData.length || 0,
        featuredTestimonials: testimonialsData.filter((t: any) => t.featured).length || 0,
        spotlightSchool: spotlightData?.settings?.school?.name || null,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Schools',
      value: stats.totalSchools,
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Testimonials',
      value: stats.totalTestimonials,
      icon: MessageSquareQuote,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Featured Testimonials',
      value: stats.featuredTestimonials,
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Spotlight Active',
      value: stats.spotlightSchool ? 'Yes' : 'No',
      subtitle: stats.spotlightSchool || 'No school selected',
      icon: Eye,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your admin panel statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-1">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </h3>
                  {kpi.subtitle && (
                    <p className="text-xs text-slate-500 truncate">{kpi.subtitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/dashboard/testimonials')}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <MessageSquareQuote className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-slate-800">Manage Testimonials</span>
                </div>
                <span className="text-amber-600">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/dashboard/spotlight')}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-slate-800">Update Spotlight</span>
                </div>
                <span className="text-emerald-600">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/dashboard/schools')}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-800">Browse Schools</span>
                </div>
                <span className="text-blue-600">→</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-800">System Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Platform Status</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Database</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-600">Last Updated</span>
                <span className="text-sm font-medium text-slate-800">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
