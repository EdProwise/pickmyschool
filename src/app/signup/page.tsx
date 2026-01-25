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
import { Combobox } from '@/components/ui/combobox';
import { CITY_OPTIONS } from '@/lib/indian-cities';

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

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
    if (!/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/.test(password)) errors.push('At least 1 special character');
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    if (value) validatePassword(value);
    else setPasswordErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      toast.error('Please meet all password requirements');
      return;
    }
    
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
      
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/verify-email');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-cyan-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Logo with glow effect */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity rounded-full" />
              <div className="relative text-2xl sm:text-4xl font-bold flex items-center justify-center gap-1.5 sm:gap-2">
                <Sparkles className="text-purple-500 w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-foreground">Pick</span>
                <span style={{ color: '#04d3d3' }}>MySchool</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-1.5 sm:mt-2 text-[10px] sm:text-sm">Start Your Journey Today</p>
          </Link>
        </div>

        {/* Main card with glassmorphism */}
        <div className="relative group">
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          
          <Card className="relative border-0 bg-white/70 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl sm:rounded-3xl">
            {/* Top accent line */}
            <div className="h-1 sm:h-1.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500" />
            
            <CardHeader className="space-y-1 sm:space-y-2 pb-4 sm:pb-6 pt-6 sm:pt-8 px-5 sm:px-8">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center text-xs sm:text-base px-2">
                Join thousands finding their perfect school
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-5 sm:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Role Selection */}
                <div className="space-y-2.5 sm:space-y-3">
                  <Label className="text-xs sm:text-sm font-semibold px-1">I am a</Label>
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'school')}>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="relative">
                        <RadioGroupItem
                          value="student"
                          id="student"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="student"
                          className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white/50 p-3 sm:p-6 hover:bg-cyan-50 hover:border-cyan-300 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-cyan-50 peer-data-[state=checked]:to-blue-50 cursor-pointer transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
                            <GraduationCap size={20} className="text-white sm:w-8 sm:h-8" />
                          </div>
                          <span className="font-bold text-xs sm:text-base">Student / Parent</span>
                          <span className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">Find the perfect school</span>
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
                          className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white/50 p-3 sm:p-6 hover:bg-purple-50 hover:border-purple-300 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-purple-50 peer-data-[state=checked]:to-pink-50 cursor-pointer transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
                            <Building2 size={20} className="text-white sm:w-8 sm:h-8" />
                          </div>
                          <span className="font-bold text-xs sm:text-base">School User</span>
                          <span className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">Manage your institution</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm font-semibold px-1">
                      {role === 'student' ? 'Full Name' : 'School Name'} *
                    </Label>
                    <div className="relative group">
                      <Input
                        id="name"
                        type="text"
                        placeholder={role === 'student' ? 'John Doe' : 'Your School Name'}
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="relative h-11 sm:h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-semibold px-1">Email Address *</Label>
                    <div className="relative group">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="relative h-11 sm:h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="password" className="text-xs sm:text-sm font-semibold px-1">Password *</Label>
                      <div className="relative group">
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 8 characters"
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={handlePasswordChange}
                            className="relative h-11 sm:h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 pr-11 rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cyan-600 transition-colors p-1"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      {formData.password && (
                        <div className="mt-2 space-y-1 px-1">
                          {['At least 8 characters', 'At least 1 uppercase letter', 'At least 1 special character'].map((req) => (
                            <div key={req} className="flex items-center gap-2 text-[10px] sm:text-xs">
                              {!passwordErrors.includes(req) ? (
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                              ) : (
                                <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={!passwordErrors.includes(req) ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                {req}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold px-1">Phone Number</Label>
                    <div className="relative group">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="relative h-11 sm:h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="city" className="text-xs sm:text-sm font-semibold px-1">City</Label>
                      <div className="relative group">
                        <Combobox
                          options={CITY_OPTIONS}
                          value={formData.city}
                          onChange={(value) => setFormData({ ...formData, city: value })}
                          placeholder="Select city..."
                          searchPlaceholder="Search cities..."
                          className="relative h-11 sm:h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                        />
                      </div>
                    </div>

                    {role === 'student' && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="class" className="text-xs sm:text-sm font-semibold px-1">Class/Grade</Label>
                      <div className="relative group">
                        <Input
                          id="class"
                          type="text"
                          placeholder="e.g., 6th Grade"
                          value={formData.class}
                          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                          className="relative h-11 sm:h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-3 sm:p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
                  <CheckCircle2 className="text-cyan-600 mt-0.5 flex-shrink-0" size={14} />
                  <p className="text-[10px] sm:text-xs text-cyan-900 leading-relaxed">
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
                  className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus size={18} className="sm:w-5 sm:h-5" />
                      Create Account
                      <ArrowRight className="group-hover:translate-x-1 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6 sm:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/70 px-3 sm:px-4 text-muted-foreground font-medium">Already have an account?</span>
                </div>
              </div>

              <div className="text-center px-1">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1.5 sm:gap-2 font-bold hover:underline text-sm sm:text-base transition-colors group"
                  style={{ color: '#04d3d3' }}
                >
                  Sign in instead
                  <ArrowRight className="group-hover:translate-x-1 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to home link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>

  );
}