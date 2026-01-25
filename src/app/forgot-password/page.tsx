
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
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

      <div className="w-full max-w-md relative z-10">
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
          </Link>
        </div>

        <Card className="relative border-0 bg-white/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
          
          <CardHeader className="space-y-2 pb-6 pt-8 px-8">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {submitted ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {submitted 
                ? "We've sent a password reset link to your email address." 
                : "Enter your email and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="relative h-12 bg-white/50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 transition-all pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Link...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={20} />
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="text-cyan-600" size={40} />
                </div>
                <p className="text-muted-foreground">
                  If you don't see the email, check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="w-full h-12 border-2"
                >
                  Try another email
                </Button>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-colors"
                style={{ color: '#04d3d3' }}
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
