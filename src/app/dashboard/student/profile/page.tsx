'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Lock, User, Mail, Shield, Save, LogOut, Phone, MapPin, GraduationCap, Edit, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';
import { CITY_OPTIONS } from '@/lib/indian-cities';
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
} from "@/components/ui/alert-dialog";

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    class: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setEditData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            city: data.user.city || '',
            class: data.user.class || '',
          });
          // Update local storage with fresh data
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // If token is invalid, fall back to localStorage or redirect
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setEditData({
              name: parsedUser.name || '',
              email: parsedUser.email || '',
              phone: parsedUser.phone || '',
              city: parsedUser.city || '',
              class: parsedUser.class || '',
            });
          } else {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setEditData({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            city: parsedUser.city || '',
            class: parsedUser.class || '',
          });
        }
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/student')}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-white/90 mt-1">Manage your account settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Information Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details provided during signup</CardDescription>
                </div>
              </div>
              {!isEditingProfile ? (
                <Button 
                  onClick={() => setIsEditingProfile(true)}
                  variant="outline"
                  className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        city: user.city || '',
                        class: user.class || '',
                      });
                    }}
                    variant="ghost"
                    className="text-gray-500 hover:bg-gray-100"
                    disabled={updatingProfile}
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Check size={16} className="mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <User size={16} className="text-cyan-600" />
                    Full Name
                  </Label>
                  <Input
                    value={isEditingProfile ? editData.name : (user.name || 'Not provided')}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    disabled={!isEditingProfile || updatingProfile}
                    className="bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail size={16} className="text-cyan-600" />
                    Email Address
                  </Label>
                  <Input
                    value={isEditingProfile ? editData.email : (user.email || 'Not provided')}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!isEditingProfile || updatingProfile}
                    className="bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Phone size={16} className="text-cyan-600" />
                    Phone Number
                  </Label>
                  <Input
                    value={isEditingProfile ? editData.phone : (user.phone || 'Not provided')}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!isEditingProfile || updatingProfile}
                    className="bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin size={16} className="text-cyan-600" />
                    City
                  </Label>
                  {isEditingProfile ? (
                    <Combobox
                      options={CITY_OPTIONS}
                      value={editData.city}
                      onChange={(value) => setEditData({ ...editData, city: value })}
                      placeholder="Select city"
                      disabled={updatingProfile}
                    />
                  ) : (
                    <Input
                      value={user.city || 'Not provided'}
                      disabled
                      className="bg-white border-gray-200"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <GraduationCap size={16} className="text-cyan-600" />
                    Class / Grade
                  </Label>
                  <Input
                    value={isEditingProfile ? editData.class : (user.class || 'Not provided')}
                    onChange={(e) => setEditData({ ...editData, class: e.target.value })}
                    disabled={!isEditingProfile || updatingProfile}
                    className="bg-white border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Enter class/grade"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Shield size={16} className="text-cyan-600" />
                    Account Type
                  </Label>
                  <div className="px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-md">
                    <span className="font-semibold text-cyan-700 capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Change Password Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Lock className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="h-12 pr-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-600 transition-colors p-1"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Separator />

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="h-12 pr-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-600 transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="h-12 pr-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li>At least 6 characters long</li>
                  <li>New password must match confirmation</li>
                  <li>Must be different from current password</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={20} />
                    Update Password
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-2 border-red-100 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <div>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Delete Account</h3>
                <p className="text-sm text-red-700">Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                    disabled={deletingAccount}
                  >
                    <Trash2 className="mr-2" size={18} />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data (enquiries, chats, reviews, and profile) from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingAccount ? "Deleting..." : "Yes, Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator className="bg-red-100" />

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out from your account</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-200 hover:bg-gray-100"
              >
                <LogOut className="mr-2" size={18} />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
