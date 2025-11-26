'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { login } from '@/lib/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Login successful!');
      
      // Redirect based on role
      if (response.user.role === 'student') {
        router.push('/dashboard/student');
      } else if (response.user.role === 'school') {
        router.push('/dashboard/school');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-300/10 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo with glow effect */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity rounded-full" />
              <div className="relative text-4xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="text-cyan-500" size={32} />
                <span className="text-foreground">Pick</span>
                <span style={{ color: '#04d3d3' }}>MySchool</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Discover Your Perfect School</p>
          </Link>
        </div>

        {/* Main card with glassmorphism */}
        <div className="relative group">
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          
          <Card className="relative border-0 bg-white/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Top accent line */}
            <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
            
            <CardHeader className="space-y-2 pb-6 pt-8 px-8">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-base">
                Sign in to continue your journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="relative h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="relative h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 pr-12 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-600 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-semibold hover:underline transition-colors"
                    style={{ color: '#04d3d3' }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn size={20} />
                      Sign In
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/70 px-4 text-muted-foreground font-medium">New to PickMySchool?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-2 font-semibold hover:underline text-base transition-colors group"
                  style={{ color: '#04d3d3' }}
                >
                  Create an account
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to home link */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}