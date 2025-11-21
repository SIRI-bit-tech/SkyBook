'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plane, User, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'admin' }),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-[#1E3A5F] p-4 rounded-2xl">
            <Plane className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">SkyBook Admin Portal</h1>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, Administrator</h2>
          <p className="text-gray-600 text-sm">
            Please enter your credentials to access the admin portal.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email / Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                id="admin-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 rounded-lg pl-11 pr-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                placeholder="Email / Username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 rounded-lg pl-11 pr-12 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a href="#" className="text-sm text-[#1E3A5F] hover:text-[#2A4A73] font-medium">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A5F] hover:bg-[#2A4A73] text-white font-semibold py-3 rounded-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an admin account?{' '}
          <a
            href="/admin-auth/register"
            className="text-[#1E3A5F] hover:text-[#2A4A73] font-semibold"
          >
            Register here
          </a>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2024 SkyBook. All rights reserved.</p>
      </div>
    </div>
  );
}
