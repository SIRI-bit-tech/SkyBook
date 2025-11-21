'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plane, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/carousel/flight-3.jpg)',
              filter: 'blur(8px) brightness(0.7)',
            }}
          />
          <div className="absolute inset-0 bg-white/40" />
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#1E3A5F]">
            <Plane className="w-6 h-6" />
            <span className="text-xl font-bold">SkyBook</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[#1E3A5F] hover:text-[#2A4A73]">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </header>

        {/* Success Card */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re All Set!</h1>
          <p className="text-gray-600 mb-8">
            Thanks for your request. Keep an eye on your inbox for password reset instructions from
            SkyBook.
          </p>

          <Link href="/login">
            <Button className="w-full bg-[#1E3A5F] hover:bg-[#2A4A73] text-white font-semibold py-3 rounded-lg">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/carousel/flight-3.jpg)',
            filter: 'blur(8px) brightness(0.7)',
          }}
        />
        <div className="absolute inset-0 bg-white/40" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[#1E3A5F]">
          <Plane className="w-6 h-6" />
          <span className="text-xl font-bold">SkyBook</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-[#1E3A5F] hover:text-[#2A4A73]">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white">Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Reset Password Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            No worries! Enter your email and we&apos;ll send you reset instructions.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A5F] hover:bg-[#2A4A73] text-white font-semibold py-3 rounded-lg"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-[#1E3A5F] hover:text-[#2A4A73] font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
