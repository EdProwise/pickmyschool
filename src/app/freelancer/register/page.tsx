'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Eye, EyeOff, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function FreelancerRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: '', referredBy: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await fetch('/api/freelancer/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Verification email resent! Check your inbox.');
      } else {
        toast.error(data.error || 'Failed to resend. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
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

      setRegisteredEmail(form.email);
      setRegistered(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-white">PickMySchool</span>
            </Link>
          </div>
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg mb-5">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                We've sent a verification link to
              </p>
              <p className="text-emerald-300 font-semibold text-sm mb-4 break-all">{registeredEmail}</p>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Click the link in the email to verify your account. The link expires in 24 hours.
              </p>
              <Link href="/freelancer/login">
                <Button className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold">
                  Go to Login
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="w-full h-10 mt-3 border-white/20 text-white hover:bg-white/10 text-sm"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Resending…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Resend Verification Email
                  </span>
                )}
              </Button>
              <p className="text-gray-500 text-xs mt-3">
                Didn't receive it? Check your spam folder or click resend above.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
