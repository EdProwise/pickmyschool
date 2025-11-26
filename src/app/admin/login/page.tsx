'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      // Store admin token
      localStorage.setItem('admin_token', data.token);
      toast.success('Welcome back, Admin!');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#04d3d3', animationDelay: '2s' }} />
      <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                Super Admin
                <Sparkles className="w-6 h-6" style={{ color: '#04d3d3' }} />
              </CardTitle>
              <CardDescription className="text-gray-300 mt-2">
                PickMySchool Admin Portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Email</label>
                <Input
                  type="email"
                  placeholder="admin@pickmyschool.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-300 hover:shadow-cyan-500/50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  'Login to Admin Panel'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Authorized personnel only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
