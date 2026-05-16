'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    fetch(`/api/freelancer/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 'VERIFIED') {
          setStatus('success');
          setMessage(data.message);
        } else if (data.code === 'ALREADY_VERIFIED') {
          setStatus('already');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

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
              <Briefcase className="w-8 h-8 text-white" />
            </div>

            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-bold text-white mb-2">Verifying your email…</h2>
                <p className="text-gray-300 text-sm">Please wait a moment.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                <p className="text-gray-300 text-sm mb-6">{message}</p>
                <Button
                  onClick={() => router.push('/freelancer/login')}
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                >
                  Continue to Login
                </Button>
              </>
            )}

            {status === 'already' && (
              <>
                <CheckCircle2 className="w-14 h-14 text-teal-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Already Verified</h2>
                <p className="text-gray-300 text-sm mb-6">{message}</p>
                <Button
                  onClick={() => router.push('/freelancer/login')}
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                >
                  Go to Login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                <p className="text-gray-300 text-sm mb-6">{message}</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/freelancer/register')}
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                  >
                    Register Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/freelancer/login')}
                    className="w-full h-11 border-white/30 text-white hover:bg-white/10"
                  >
                    Back to Login
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FreelancerVerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
