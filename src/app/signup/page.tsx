'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, GraduationCap, Building2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { signup } from '@/lib/api';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'school'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    class: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (formData.phone) data.phone = formData.phone;
      if (formData.city) data.city = formData.city;
      if (role === 'student' && formData.class) data.class = formData.class;

      await signup(data);
      
      toast.success('Account created successfully! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-cyan-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300/10 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Logo with glow effect */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity rounded-full" />
              <div className="relative text-4xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="text-purple-500" size={32} />
                <span className="text-foreground">Pick</span>
                <span style={{ color: '#04d3d3' }}>MySchool</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Start Your Journey Today</p>
          </Link>
        </div>

        {/* Main card with glassmorphism */}
        <div className="relative group">
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          
          <Card className="relative border-0 bg-white/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Top accent line */}
            <div className="h-1.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500" />
            
            <CardHeader className="space-y-2 pb-6 pt-8 px-8">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center text-base">
                Join thousands finding their perfect school
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">I am a</Label>
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'school')}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <RadioGroupItem
                          value="student"
                          id="student"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="student"
                          className="flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-white/50 p-6 hover:bg-cyan-50 hover:border-cyan-300 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-cyan-50 peer-data-[state=checked]:to-blue-50 cursor-pointer transition-all duration-300 group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                            <GraduationCap size={32} className="text-white" />
                          </div>
                          <span className="font-semibold text-base">Student / Parent</span>
                          <span className="text-xs text-muted-foreground mt-1">Find the perfect school</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem
                          value="school"
                          id="school"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="school"
                          className="flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-white/50 p-6 hover:bg-purple-50 hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-purple-50 peer-data-[state=checked]:to-pink-50 cursor-pointer transition-all duration-300 group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                            <Building2 size={32} className="text-white" />
                          </div>
                          <span className="font-semibold text-base">School</span>
                          <span className="text-xs text-muted-foreground mt-1">Manage your institution</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      {role === 'student' ? 'Full Name' : 'School Name'} *
                    </Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={role === 'student' ? 'John Doe' : 'Your School Name'}
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="relative h-11 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="relative h-11 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="relative h-11 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="relative h-11 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="e.g., Delhi"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="relative h-11 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="class" className="text-sm font-semibold">Class/Grade</Label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                        <Input
                          id="class"
                          type="text"
                          placeholder="e.g., 6th Grade"
                          value={formData.class}
                          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                          className="relative h-11 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
                  <CheckCircle2 className="text-cyan-600 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-xs text-cyan-900">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="font-semibold underline hover:text-cyan-600">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-semibold underline hover:text-cyan-600">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus size={20} />
                      Create Account
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/70 px-4 text-muted-foreground font-medium">Already have an account?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 font-semibold hover:underline text-base transition-colors group"
                  style={{ color: '#04d3d3' }}
                >
                  Sign in instead
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