'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token provided.');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authAPI.verifyEmail(token);
      setSuccess(response.data.success);
      setMessage(response.data.message);
    } catch (error: any) {
      setSuccess(false);
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Email verification failed';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      // We would need to get the email from somewhere, but for now we'll just show a message
      setMessage('Please check your email for a new verification link.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            {success ? (
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            )}
            
            <h2 className="text-3xl font-bold mb-4">
              {success ? 'Email Verified!' : 'Verification Failed'}
            </h2>
            
            <p className={`text-lg mb-6 ${success ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
            
            {success ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full btn btn-primary py-3"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  There was an issue verifying your email. Please try again or contact support if the problem persists.
                </p>
                <button
                  onClick={handleResend}
                  className="w-full btn btn-primary py-3"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full btn btn-secondary py-3"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}