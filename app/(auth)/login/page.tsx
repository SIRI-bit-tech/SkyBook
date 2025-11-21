'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import AuthLayout from '@/components/auth/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn.email({
        email: credentials.email,
        password: credentials.password,
      });
      
      // Set role cookie for middleware
      await fetch('/api/auth/set-role', { method: 'POST' });
      
      // Validate redirect parameter to prevent open redirect vulnerability
      const redirectParam = searchParams.get('redirect');
      let validatedRedirect = '/dashboard';
      
      if (redirectParam) {
        const target = redirectParam;
        // Only allow internal paths: must start with '/' but not '//' and no protocol
        if (target.startsWith('/') && !target.startsWith('//') && !target.includes('://')) {
          validatedRedirect = target;
        }
      }
      
      router.push(validatedRedirect);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  return (
    <AuthLayout title="Log in to SkyBook" subtitle="Welcome back! Please enter your details.">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm text-[#1E3A5F] hover:text-[#2A4A73]">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 pr-12 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1E3A5F] hover:bg-[#2A4A73] text-white font-semibold py-3 rounded-lg"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-50 text-gray-500">OR</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#1E3A5F] hover:text-[#2A4A73] font-medium">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
