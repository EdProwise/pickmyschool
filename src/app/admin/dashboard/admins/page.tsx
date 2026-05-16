'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2, Shield, User, Mail, Calendar, Crown } from 'lucide-react';

interface Admin {
  _id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function AdminManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    checkSuperAdminStatus();
    loadAdmins();
  }, []);

  const checkSuperAdminStatus = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      // Decode token to check isSuperAdmin flag
      const payload = JSON.parse(atob(token.split('.')[1]));
      // We'll verify with the API by trying to fetch admins
    } catch (error) {
      console.error('Error checking super admin status:', error);
    }
  };

  const loadAdmins = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        setIsSuperAdmin(false);
        toast.error('Access denied. Only the main Super Admin can manage admins.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data);
      setIsSuperAdmin(true);
    } catch (error) {
      console.error('Failed to load admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('All fields are required');
      return;
    }

    if (newAdmin.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAdmin),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      toast.success('Admin created successfully');
      setIsDialogOpen(false);
      setNewAdmin({ name: '', email: '', password: '' });
      loadAdmins();
    } catch (error) {
      console.error('Failed to create admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete admin');
      }

      toast.success('Admin deleted successfully');
      loadAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-8">
        <Card className="border-0 shadow-lg max-w-md mx-auto mt-20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-600">
              Only the main Super Admin can access this page and manage other admins.
            </p>
            <Button
              onClick={() => router.push('/admin/dashboard')}
              className="mt-6"
              style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Management</h1>
          <p className="text-slate-600">Manage admin accounts for your platform</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}
            >
              <UserPlus className="w-4 h-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Create a new admin account. They will be able to access the admin dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (min 8 characters)"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={creating}
                style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}
              >
                {creating ? 'Creating...' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Email</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Created</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 text-xs whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${admin.isSuperAdmin ? 'bg-amber-100' : 'bg-slate-100'}`}>
                          {admin.isSuperAdmin ? (
                            <Crown className="w-4 h-4 text-amber-600" />
                          ) : (
                            <User className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <span className="font-medium text-slate-800">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{admin.email}</td>
                    <td className="px-4 py-3 text-center">
                      {admin.isSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Crown className="w-3 h-3" /> Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!admin.isSuperAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{admin.name}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAdmin(admin._id)} className="bg-red-500 hover:bg-red-600">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
