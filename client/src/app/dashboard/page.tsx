'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateRoomButton from '@/components/CreateRoomButton';
import JoinRoomButton from '@/components/JoinRoomButton';
import RecentRooms from '@/components/RecentRooms';
import { useUserStore } from '@/stores/userStore';
import {
  Code2,
  Users,
  MessageSquare,
  Clock,
  Shield,
  Zap,
  GitBranch,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  LogOut
} from 'lucide-react';

export default function DashboardPage(): React.JSX.Element {
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const [roomCount, setRoomCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !user) {
      router.push('/login');
    }
  }, [hasHydrated, user, router]);

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 animate-pulse font-medium text-lg">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Live Coding",
      description: "Real-time collaboration with syntax highlighting",
      color: "bg-blue-500",
      lightBg: "bg-blue-50"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Team Chat",
      description: "Integrated messaging for instant communication",
      color: "bg-purple-500",
      lightBg: "bg-purple-50"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Version History",
      description: "Automatic saves with restore capabilities",
      color: "bg-orange-500",
      lightBg: "bg-orange-50"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Rooms",
      description: "Encrypted sessions with access control",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50"
    }
  ];

  const stats = [
    { label: "Active Rooms", value: roomCount, icon: <Users className="w-5 h-5" />, color: "blue" },
    { label: "Code Sessions", value: "24/7", icon: <Clock className="w-5 h-5" />, color: "purple" },
    { label: "Collaborators", value: "∞", icon: <GitBranch className="w-5 h-5" />, color: "emerald" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header - Full width with extreme left/right alignment */}
      {/* Header - Full width with extreme left/right alignment */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Name - Extreme Left */}
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-gray-900">Code</span>
                <span className="text-blue-600">Sync</span>
              </h1>
            </div>

            {/* User Info - Extreme Right */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200 px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Welcome back to your workspace</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900">
            Hello, <span className="text-blue-600">{user ? user.fullName.split(' ')[0] : 'Developer'}</span>
            <span className="inline-block animate-wave ml-2"></span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your collaborative coding workspace is ready. Start building amazing things together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <CreateRoomButton className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Create Room</span>
            </CreateRoomButton>
            <JoinRoomButton className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span>Join Room</span>
            </JoinRoomButton>
          </div>
        </div>

        {/* Stats Cards */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                    {stat.icon}
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Rooms Section */}
        {user && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                      <Code2 className="w-7 h-7 text-blue-600" />
                      Your Coding Rooms
                    </h3>
                    <p className="text-sm text-gray-600">
                      {roomCount === 0 ? 'Create your first room to start collaborating' : `${roomCount} active ${roomCount === 1 ? 'session' : 'sessions'}`}
                    </p>
                  </div>
                  {roomCount > 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      <Zap className="w-4 h-4" />
                      All Synced
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <RecentRooms onRoomCountChange={setRoomCount} />
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Why Choose CodeSync?</h3>
            <p className="text-gray-600">Powerful features for seamless collaboration</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} ${feature.lightBg} mb-4 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Banner */}
        {user && roomCount > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center shadow-2xl">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative z-10">
              <Award className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">🎉 Great Work!</h3>
              <p className="text-blue-100">
                You've created {roomCount} coding {roomCount === 1 ? 'session' : 'sessions'}. Keep collaborating!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © 2025 CodeSync. Built with ❤️ for developers.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
