'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function FreelancerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: '', referredBy: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/freelancer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      toast.success('Account created! Please login.');
      router.push('/freelancer/login');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute -bottom-20 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-white">PickMySchool</span>
            </Link>
          </div>

          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Become a Freelancer</CardTitle>
                <CardDescription className="text-gray-300 mt-1">Create your freelancer account</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Full Name *</label>
                  <Input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required
                    className="h-11 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-emerald-400" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Email Address *</label>
                  <Input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required
                    className="h-11 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-emerald-400" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Password *</label>
                  <div className="relative">
                    <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} required
                      className="h-11 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-emerald-400 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">Phone</label>
                    <Input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange}
                      className="h-11 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">City</label>
                    <Input name="city" placeholder="Mumbai" value={form.city} onChange={handleChange}
                      className="h-11 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Referral Code <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Input name="referredBy" placeholder="Enter referral code" value={form.referredBy} onChange={handleChange}
                    className="h-11 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-emerald-400" />
                </div>

                <Button type="submit" disabled={isLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg mt-2">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : 'Create Account'}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link href="/freelancer/login" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
