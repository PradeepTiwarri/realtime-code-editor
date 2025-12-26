'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AuthForm from '@/components/AuthForm';
import { useUserStore } from '@/stores/userStore';

type SignupData = {
  fullName: string;
  email: string;
  password: string;
};

export default function SignupPage(): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const setUser = useUserStore((state) => state.setUser);

  const handleSignup = async (data: SignupData): Promise<void> => {
    // 👇 Ensure this points to the correct server URL (Vercel or Localhost)
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message ?? 'Signup failed');
        return;
      }

      await setUser(result.user);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      
      {/* --- Illustration Section --- */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-auto bg-gray-50">
        <Image
          src="/images/auth/login-background.png" // Reusing the auth background
          alt="Signup illustration"
          fill
          priority // ⚡️ Preloads image for instant rendering
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* --- Signup Form Section --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-12 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Brand */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              <span className="text-blue-600">Code</span>Sync
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Create your free account to start collaborating.
            </p>
          </div>

          {/* Form */}
          <AuthForm type="signup" onSubmit={handleSignup} />

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}