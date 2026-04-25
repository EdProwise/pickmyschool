'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Users, GraduationCap, Building2, CheckCircle2, XCircle, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

interface UserRecord {
  _id: string;
  name: string;
  role: 'student' | 'school';
  email: string;
  phone?: string;
  city?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  totalStudents: number;
  totalSchools: number;
  totalVerified: number;
  totalActive: number;
}

export default function UserDatabasePage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalStudents: 0, totalSchools: 0, totalVerified: 0, totalActive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setStats(data.stats);
      } else {
        toast.error('Failed to load users');
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: { role?: string; emailVerified?: boolean; isActive?: boolean }) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...data.user } : u)));
        toast.success('User updated successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update user');
      }
    } catch {
      toast.error('Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive !== false) ||
      (statusFilter === 'inactive' && u.isActive === false);
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term) ||
      u.phone?.includes(term);
    return matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">User Database</h1>
          <p className="text-slate-600">All registered users — students and school accounts</p>
        </div>
        <Button variant="outline" onClick={loadUsers} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Students</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Schools</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalSchools}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Verified</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalVerified}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalActive}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, city or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="school">Schools</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-slate-500 flex items-center">
          {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Role</TableHead>
                <TableHead className="font-semibold text-slate-700">Email Address</TableHead>
                <TableHead className="font-semibold text-slate-700">Phone Number</TableHead>
                <TableHead className="font-semibold text-slate-700">City</TableHead>
                <TableHead className="font-semibold text-slate-700">Email Verified</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    className={`transition-colors ${user.isActive === false ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50'}`}
                  >
                    <TableCell className="font-medium text-slate-800">
                      {user.name || <span className="text-slate-400 italic">—</span>}
                    </TableCell>
                    <TableCell>
                      {user.role === 'student' ? (
                        <Badge className="bg-blue-100 text-blue-700 border-0 gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Student
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1">
                          <Building2 className="w-3 h-3" />
                          School
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{user.email}</TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {user.phone || <span className="text-slate-400">—</span>}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {user.city || <span className="text-slate-400">—</span>}
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> True
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
                          <XCircle className="w-4 h-4" /> False
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-teal-600 text-sm font-medium">
                          <ShieldCheck className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
                          <ShieldOff className="w-4 h-4" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Toggle active/inactive */}
                        <Button
                          size="sm"
                          variant={user.isActive !== false ? 'destructive' : 'default'}
                          disabled={updatingId === user._id}
                          onClick={() => updateUser(user._id, { isActive: user.isActive === false })}
                          className="text-xs h-7 px-2"
                        >
                          {user.isActive !== false ? 'Deactivate' : 'Activate'}
                        </Button>
                        {/* Toggle email verified */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === user._id}
                          onClick={() => updateUser(user._id, { emailVerified: !user.emailVerified })}
                          className="text-xs h-7 px-2"
                        >
                          {user.emailVerified ? 'Unverify' : 'Verify'}
                        </Button>
                        {/* Toggle role */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === user._id}
                          onClick={() =>
                            updateUser(user._id, {
                              role: user.role === 'student' ? 'school' : 'student',
                            })
                          }
                          className="text-xs h-7 px-2"
                        >
                          → {user.role === 'student' ? 'School' : 'Student'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
