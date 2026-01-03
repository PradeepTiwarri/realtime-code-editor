// src/app/room/[roomId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import RoomHeader from '@/components/RoomHeader';
import ChatSidebar from '@/components/ChatSidebar';
import MonacoEditor from '@/components/MonacoEditor';
import RoomPageConnection from '@/components/RoomPageConnection';
import { useUserStore } from '@/stores/userStore';
import { useParams } from 'next/navigation';
import VersionHistoryModal from '@/components/VersionHistoryModal';
import { MessageSquare } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [language, setLanguage] = useState('javascript');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Start closed on mobile

  // ✅ Retrieve state from Zustand store
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const user = useUserStore((state) => state.user);
  const onlineUsernames = useUserStore((state) => state.onlineUsers);

  // ✅ Transform the array of strings into object format
  const onlineUsers = onlineUsernames.map((username, index) => ({
    id: index.toString(),
    name: username,
    isYou: username === user?.fullName,
  }));

  // Open chat by default on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsChatOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      console.log('✅ User after hydration:', user);
    }
  }, [hasHydrated, user]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white px-4">
        <div className="text-center">
          <p className="text-xl mb-4">No user found</p>
          <p className="text-gray-400">Please log in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header with Dynamic Online Users */}
      <RoomHeader
        onlineUsers={onlineUsers}
        username={user.fullName}
        onShowHistory={() => setShowVersionHistory(true)}
      />

      {/* Room Connection Component */}
      <RoomPageConnection />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor language={language} />
        </div>

        {/* Desktop: Chat Sidebar with Slide Animation */}
        <div
          className={`hidden lg:block transition-all duration-300 ease-in-out ${isChatOpen ? 'w-80' : 'w-0'
            } overflow-hidden bg-slate-800 border-l border-slate-700`}
        >
          {isChatOpen && (
            <ChatSidebar
              id={user.id}
              name={user.fullName}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </div>

        {/* Mobile/Tablet: Full-screen Chat Overlay */}
        {isChatOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-sm">
            <div className="h-full flex flex-col">
              <ChatSidebar
                id={user.id}
                name={user.fullName}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Floating Chat Toggle Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all z-50 hover:scale-110"
            title="Open Chat"
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            {/* Notification badge placeholder */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </button>
        )}
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistoryModal
          roomId={roomId}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}