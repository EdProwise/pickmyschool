'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-cyan-50" />
      
      <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md relative z-10">
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
          </Link>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
          
          <Card className="relative border-0 bg-white/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500" />
            
            <CardHeader className="space-y-2 pb-6 pt-8 px-8 text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Email Verification
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8 text-center">
              {status === 'loading' && (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-cyan-600 animate-spin" />
                  </div>
                  <p className="text-muted-foreground">Verifying your email...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-green-700">Verified!</h3>
                    <p className="text-muted-foreground">{message}</p>
                  </div>
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <span className="flex items-center gap-2">
                      Continue to Login
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </span>
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center animate-in zoom-in duration-500">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-red-700">Verification Failed</h3>
                    <p className="text-muted-foreground">{message}</p>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/signup')}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 hover:from-purple-600 hover:via-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Try Signing Up Again
                    </Button>
                    <Link href="/login" className="block text-sm text-muted-foreground hover:text-cyan-600 transition-colors">
                      Already verified? Login here
                    </Link>
                  </div>
                </div>
              )}

              {status === 'no-token' && (
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center animate-in zoom-in duration-500">
                    <Mail className="h-10 w-10 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-amber-700">Check Your Email</h3>
                    <p className="text-muted-foreground">
                      Please click the verification link sent to your email address.
                    </p>
                  </div>
                  <Link href="/login" className="block text-sm text-muted-foreground hover:text-cyan-600 transition-colors">
                    Already verified? Login here
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
