'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, GraduationCap, Building2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-bold">
              <span className="text-foreground">Pick</span>
              <span style={{ color: '#04d3d3' }}>MySchool</span>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join PickMySchool and find the perfect school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <Label className="mb-3">I am a</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'school')}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem
                        value="student"
                        id="student"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="student"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#04d3d3] cursor-pointer"
                      >
                        <GraduationCap size={32} className="mb-2" />
                        <span className="font-semibold">Student / Parent</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="school"
                        id="school"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="school"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#04d3d3] cursor-pointer"
                      >
                        <Building2 size={32} className="mb-2" />
                        <span className="font-semibold">School</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {role === 'student' ? 'Full Name' : 'School Name'} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={role === 'student' ? 'John Doe' : 'Your School Name'}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 1234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g., Delhi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                {role === 'student' && (
                  <div>
                    <Label htmlFor="class">Class/Grade</Label>
                    <Input
                      id="class"
                      type="text"
                      placeholder="e.g., 6th Grade"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                style={{ backgroundColor: '#04d3d3', color: 'white' }}
                disabled={loading}
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    <UserPlus className="mr-2" size={18} />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#04d3d3' }}>
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
