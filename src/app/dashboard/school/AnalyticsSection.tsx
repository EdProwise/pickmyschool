'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, TrendingUp, Users, Star, Calendar, Download,
  ArrowUpRight, ArrowDownRight, Activity, Target, CheckCircle2,
  Clock, MessageSquare, Eye, Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  enquiryStats: {
    byStatus: Array<{ total: number; status: string }> | null;
    total: number;
    trend: Array<{ date: string; count: number }> | null;
    byClass: Array<{ class: string; count: number }> | null;
  };
  conversionFunnel: {
    totalEnquiries: number;
    contacted: number;
    converted: number;
    contactRate: string;
    conversionRate: string;
  };
  reviewStats: {
    byStatus: Array<{ total: number; approvalStatus: string }> | null;
    averageRating: string;
    totalRatings: number;
    distribution: Array<{ rating: number; count: number }> | null;
  };
  recentActivity: {
    enquiries: Array<{
      id: number;
      studentName: string;
      studentClass: string;
      status: string;
      createdAt: string;
    }> | null;
    reviews: Array<{
      id: number;
      studentName: string;
      rating: number;
      approvalStatus: string;
      createdAt: string;
    }> | null;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

interface AnalyticsSectionProps {
  schoolId: number;
}

export function AnalyticsSection({ schoolId }: AnalyticsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilter, setDateFilter] = useState('30days');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async (customStartDate?: string, customEndDate?: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[Analytics] No token found');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (customStartDate) params.append('startDate', customStartDate);
      if (customEndDate) params.append('endDate', customEndDate);

      console.log('[Analytics] Fetching analytics...', {
        url: `/api/schools/analytics?${params.toString()}`,
        customStartDate,
        customEndDate
      });

      const response = await fetch(`/api/schools/analytics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[Analytics] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Analytics] Error response:', errorText);
        throw new Error(`Failed to fetch analytics: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Analytics] Data loaded successfully:', data);
      setAnalytics(data);
    } catch (error) {
      console.error('[Analytics] Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    const today = new Date();
    let start = new Date();

    switch (filter) {
      case '7days':
        start.setDate(today.getDate() - 7);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case '90days':
        start.setDate(today.getDate() - 90);
        break;
      case '1year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        return;
      default:
        start.setDate(today.getDate() - 30);
    }

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    loadAnalytics(startDateStr, endDateStr);
  };

  const handleCustomDateFilter = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    loadAnalytics(startDate, endDate);
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csvRows = [
      ['Analytics Report - PickMySchool'],
      ['Generated:', new Date().toLocaleString()],
      ['Date Range:', `${new Date(analytics.dateRange.start).toLocaleDateString()} - ${new Date(analytics.dateRange.end).toLocaleDateString()}`],
      [],
      ['Enquiry Statistics'],
      ['Total Enquiries:', analytics.enquiryStats.total],
      ...analytics.enquiryStats.byStatus?.map(s => [s.status, s.total]) || [],
      [],
      ['Conversion Funnel'],
      ['Total Enquiries:', analytics.conversionFunnel.totalEnquiries],
      ['Contacted:', analytics.conversionFunnel.contacted],
      ['Converted:', analytics.conversionFunnel.converted],
      ['Contact Rate:', analytics.conversionFunnel.contactRate + '%'],
      ['Conversion Rate:', analytics.conversionFunnel.conversionRate + '%'],
      [],
      ['Review Statistics'],
      ['Average Rating:', analytics.reviewStats.averageRating],
      ['Total Ratings:', analytics.reviewStats.totalRatings],
      ...analytics.reviewStats.byStatus?.map(s => [s.approvalStatus, s.total]) || [],
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-16">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6" />
            <p className="text-muted-foreground text-lg">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-16">
          <div className="text-center text-muted-foreground">
            <BarChart3 size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    New: 'bg-blue-500',
    'In Progress': 'bg-yellow-500',
    Converted: 'bg-green-500',
    Lost: 'bg-red-500',
    Closed: 'bg-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <BarChart3 className="text-white" size={20} />
              </div>
              Analytics & Reports
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={dateFilter === '7days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('7days')}
                className={dateFilter === '7days' ? 'bg-cyan-600' : ''}
              >
                7 Days
              </Button>
              <Button
                variant={dateFilter === '30days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('30days')}
                className={dateFilter === '30days' ? 'bg-cyan-600' : ''}
              >
                30 Days
              </Button>
              <Button
                variant={dateFilter === '90days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('90days')}
                className={dateFilter === '90days' ? 'bg-cyan-600' : ''}
              >
                90 Days
              </Button>
              <Button
                variant={dateFilter === '1year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('1year')}
                className={dateFilter === '1year' ? 'bg-cyan-600' : ''}
              >
                1 Year
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="mr-2" size={16} />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Custom Date Range */}
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter('custom');
                }}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter('custom');
                }}
                className="w-40"
              />
            </div>
            <Button
              onClick={handleCustomDateFilter}
              disabled={!startDate || !endDate}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              <Filter className="mr-2" size={16} />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <ArrowUpRight className="text-cyan-600" size={20} />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Total Enquiries</p>
            <p className="text-4xl font-bold text-cyan-600">{analytics.enquiryStats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="text-white" size={24} />
              </div>
              <ArrowUpRight className="text-green-600" size={20} />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Conversion Rate</p>
            <p className="text-4xl font-bold text-green-600">{analytics.conversionFunnel.conversionRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Star className="text-white" size={24} />
              </div>
              <Star className="text-yellow-600 fill-yellow-600" size={20} />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Average Rating</p>
            <p className="text-4xl font-bold text-yellow-600">{analytics.reviewStats.averageRating}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Activity className="text-white" size={24} />
              </div>
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Contact Rate</p>
            <p className="text-4xl font-bold text-purple-600">{analytics.conversionFunnel.contactRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Enquiry Status Breakdown */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="text-white" size={20} />
            </div>
            Enquiry Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.enquiryStats.byStatus?.map((stat) => {
              const percentage = ((stat.total / analytics.enquiryStats.total) * 100).toFixed(1);
              return (
                <div key={stat.status} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[stat.status] || 'bg-gray-500'}`} />
                    <p className="text-sm font-semibold text-muted-foreground">{stat.status}</p>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.total}</p>
                  <p className="text-xs text-muted-foreground">{percentage}% of total</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enquiry Trend Chart */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            Enquiry Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.enquiryStats.trend?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No trend data available</p>
            ) : (
              <div className="space-y-2">
                {analytics.enquiryStats.trend.map((trend) => {
                  const maxCount = Math.max(...analytics.enquiryStats.trend.map(t => t.count));
                  const width = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                  return (
                    <div key={trend.date} className="flex items-center gap-3">
                      <p className="text-xs text-muted-foreground w-24">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${width}%` }}
                        >
                          {trend.count > 0 && (
                            <span className="text-xs font-semibold text-white">{trend.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Class-wise Enquiries */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            Class-wise Enquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analytics.enquiryStats.byClass?.slice(0, 10).map((classData) => (
              <div key={classData.class} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <p className="text-sm font-semibold text-muted-foreground mb-2">{classData.class}</p>
                <p className="text-3xl font-bold text-purple-600">{classData.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Star className="text-white" size={20} />
            </div>
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const data = analytics.reviewStats.distribution?.find(d => d.rating === rating);
              const count = data?.count || 0;
              const percentage = analytics.reviewStats.totalRatings > 0
                ? ((count / analytics.reviewStats.totalRatings) * 100).toFixed(1)
                : '0';
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-semibold">{rating}</span>
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-end pr-3"
                      style={{ width: `${percentage}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-semibold text-white">{count}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              Recent Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.enquiries?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent enquiries</p>
              ) : (
                analytics.recentActivity.enquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div>
                      <p className="font-semibold text-sm">{enquiry.studentName}</p>
                      <p className="text-xs text-muted-foreground">{enquiry.studentClass}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${statusColors[enquiry.status]} text-white text-xs`}>
                        {enquiry.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Star className="text-white" size={20} />
              </div>
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.reviews?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent reviews</p>
              ) : (
                analytics.recentActivity.reviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div>
                      <p className="font-semibold text-sm">{review.studentName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`text-xs ${
                          review.approvalStatus === 'approved'
                            ? 'bg-green-500 text-white'
                            : review.approvalStatus === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {review.approvalStatus}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}