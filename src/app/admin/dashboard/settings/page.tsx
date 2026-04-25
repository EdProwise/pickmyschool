'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff, Check, X, Bot, KeyRound, Mail, Map } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  // AI Settings
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Email Settings
  const [gmailUser, setGmailUser] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [showGmailPassword, setShowGmailPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Maps Settings
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showMapsKey, setShowMapsKey] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(false);

  const [keysLoading, setKeysLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadSettings(token);
  }, []);

  const loadSettings = async (token: string) => {
    try {
      const res = await fetch('/api/admin/settings/api-keys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGeminiApiKey(data.geminiApiKey || '');
        setGmailUser(data.gmailUser || '');
        setGmailAppPassword(data.gmailAppPassword || '');
        setGoogleMapsApiKey(data.googleMapsApiKey || '');
      }
    } catch {
      // silent
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    const password = formData.newPassword;
    setPasswordStrength({
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [formData.newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!Object.values(passwordStrength).every((v) => v)) {
      toast.error('Password does not meet all requirements');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const saveKeys = async (fields: Record<string, string>, label: string, setLoadingFn: (v: boolean) => void) => {
    setLoadingFn(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        toast.success(`${label} saved successfully!`);
      } else {
        const err = await res.json();
        toast.error(err.error || `Failed to save ${label}`);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingFn(false);
    }
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiApiKey.trim()) { toast.error('Please enter a valid Gemini API key'); return; }
    saveKeys({ geminiApiKey }, 'Gemini API key', setAiLoading);
  };

  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailUser.trim() || !gmailAppPassword.trim()) {
      toast.error('Please fill in both Gmail User and App Password');
      return;
    }
    saveKeys({ gmailUser, gmailAppPassword }, 'Email settings', setEmailLoading);
  };

  const handleSaveMapsKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleMapsApiKey.trim()) { toast.error('Please enter a valid Google Maps API key'); return; }
    saveKeys({ googleMapsApiKey }, 'Google Maps API key', setMapsLoading);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account settings and API credentials</p>
      </div>

      <div className="max-w-2xl space-y-8">

        {/* AI Settings */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {keysLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <form onSubmit={handleSaveGeminiKey} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gemini API Key <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Used by the AI School Counselor chatbot. Get your key from{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 underline hover:text-cyan-700"
                    >
                      Google AI Studio
                    </a>
                    .
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      required
                      className="pl-10 pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showGeminiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                >
                  {aiLoading ? 'Saving...' : 'Save Gemini API Key'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {keysLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <form onSubmit={handleSaveEmailSettings} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gmail User <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    The Gmail address used to send verification and notification emails.
                  </p>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      placeholder="your@gmail.com"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gmail App Password <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Generate an App Password from{' '}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 underline hover:text-cyan-700"
                    >
                      Google Account Security
                    </a>
                    .
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={showGmailPassword ? 'text' : 'password'}
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      required
                      className="pl-10 pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGmailPassword(!showGmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showGmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                >
                  {emailLoading ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Google Maps Settings */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Google Maps Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {keysLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <form onSubmit={handleSaveMapsKey} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Google Maps API Key <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Used to display school locations. Get your key from the{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 underline hover:text-cyan-700"
                    >
                      Google Cloud Console
                    </a>
                    .
                  </p>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={showMapsKey ? 'text' : 'password'}
                      value={googleMapsApiKey}
                      onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      required
                      className="pl-10 pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMapsKey(!showMapsKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showMapsKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={mapsLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                >
                  {mapsLoading ? 'Saving...' : 'Save Google Maps API Key'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {formData.newPassword && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-slate-600">Password must contain:</p>
                    <div className="space-y-1">
                      {[
                        { key: 'hasLength', label: 'At least 8 characters' },
                        { key: 'hasUppercase', label: 'One uppercase letter' },
                        { key: 'hasLowercase', label: 'One lowercase letter' },
                        { key: 'hasNumber', label: 'One number' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          {passwordStrength[key as keyof typeof passwordStrength] ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={passwordStrength[key as keyof typeof passwordStrength] ? 'text-emerald-600' : 'text-slate-600'}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-2">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
