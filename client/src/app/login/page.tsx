'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { useUserStore } from '@/stores/userStore';

type LoginData = { email: string; password: string };

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const setUser = useUserStore((s) => s.setUser);

 const handleLogin = async (data: LoginData): Promise<void> => {
    // 👇 Add this line to get the correct URL (Render or Localhost)
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

    try {
      // 👇 Update the fetch URL to use SERVER_URL
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Illustration */}
      <div
        className="
          w-full lg:w-1/2 h-56 lg:h-auto
          bg-cover bg-center bg-no-repeat
        "
        style={{ backgroundImage: "url('/images/auth/login-background.png')" }}
      />

      {/* Right-side / below-image content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Brand */}
          <h1 className="text-3xl font-bold text-center">
            <span className="text-blue-600">Code</span>Sync
          </h1>

          {/* Form */}
          <AuthForm type="login" onSubmit={handleLogin} />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <p className="text-center text-sm text-gray-600">
            Don&rsquo;t have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
