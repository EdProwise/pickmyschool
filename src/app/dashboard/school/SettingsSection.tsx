'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Lock, UserCircle, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/lib/api';

interface SettingsSectionProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export function SettingsSection({ user, onUserUpdate }: SettingsSectionProps) {
  // Account Details State
  const [accountDetails, setAccountDetails] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    city: user.city || '',
    board: user.board || '',
  });
  const [savingAccount, setSavingAccount] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAccountDetailsChange = (field: string, value: string) => {
    setAccountDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAccountDetails = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (!accountDetails.name || !accountDetails.email) {
      toast.error('Name and email are required');
      return;
    }

    setSavingAccount(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountDetails),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update account details');
      }

      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Account details updated successfully');
    } catch (error: any) {
      console.error('Failed to update account:', error);
      toast.error(error.message || 'Failed to update account details');
    } finally {
      setSavingAccount(false);
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Details Card */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <UserCircle className="text-white" size={20} />
            </div>
            Account Details
          </CardTitle>
          <CardDescription>
            Manage your account information and signup details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                School Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={accountDetails.name}
                onChange={(e) => handleAccountDetailsChange('name', e.target.value)}
                placeholder="Enter school name"
                className="bg-white/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={accountDetails.email}
                onChange={(e) => handleAccountDetailsChange('email', e.target.value)}
                placeholder="Enter email address"
                className="bg-white/50"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={accountDetails.phone}
                onChange={(e) => handleAccountDetailsChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="bg-white/50"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold">
                City
              </Label>
              <Input
                id="city"
                value={accountDetails.city}
                onChange={(e) => handleAccountDetailsChange('city', e.target.value)}
                placeholder="Enter city"
                className="bg-white/50"
              />
            </div>

            {/* Board */}
            <div className="space-y-2">
              <Label htmlFor="board" className="text-sm font-semibold">
                Board
              </Label>
              <Input
                id="board"
                value={accountDetails.board}
                onChange={(e) => handleAccountDetailsChange('board', e.target.value)}
                placeholder="e.g., CBSE, ICSE, State Board"
                className="bg-white/50"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAccountDetails}
              disabled={savingAccount}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
            >
              <Save className="mr-2" size={18} />
              {savingAccount ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Lock className="text-white" size={20} />
            </div>
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 max-w-xl">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-semibold">
                Current Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="Enter current password"
                  className="bg-white/50 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold">
                New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Enter new password (min. 6 characters)"
                  className="bg-white/50 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                Confirm New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Confirm new password"
                  className="bg-white/50 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
            >
              <Lock className="mr-2" size={18} />
              {savingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
