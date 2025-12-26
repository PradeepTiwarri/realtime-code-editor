'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { useUserStore } from '@/stores/userStore';
import { SERVER_URL } from '@/utils/config';

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
    try {
      const res = await fetch(`${SERVER_URL}api/auth/signup`, {
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Illustration */}
      <div
        className="w-full lg:w-1/2 h-56 lg:h-auto bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth/login-background.png')" }}
      />

      {/* Right-side / below-image content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-3xl font-bold text-center">
            <span className="text-blue-600">Code</span>Sync
          </h1>

          <AuthForm type="signup" onSubmit={handleSignup} />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
