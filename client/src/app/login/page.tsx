'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AuthForm from '@/components/AuthForm';
import { useUserStore } from '@/stores/userStore';

type LoginData = { email: string; password: string };

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const setUser = useUserStore((s) => s.setUser);

  const handleLogin = async (data: LoginData): Promise<void> => {
    // 👇 Ensure this points to the correct server URL
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.message ?? 'Login failed');
        return;
      }
      if (!result.user) {
        setError('Invalid response from server');
        return;
      }

      setUser({
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
      });
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* --- Illustration Section --- 
        Improved: Uses Next/Image with priority for instant loading 
      */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-auto bg-gray-50">
        <Image
          src="/images/auth/login-background.png"
          alt="Login illustration"
          fill
          priority // ⚡️ Preloads image so it doesn't "pop in" late
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* --- Login Form Section --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-12 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              <span className="text-blue-600">Code</span>Sync
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please login to your account.
            </p>
          </div>

          {/* Form */}
          <AuthForm type="login" onSubmit={handleLogin} />

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600">
            Don&rsquo;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}