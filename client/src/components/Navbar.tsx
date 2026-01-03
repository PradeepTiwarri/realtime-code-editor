'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ChevronDown, Settings, Clock, Copy, LogOut } from 'lucide-react';
import VoiceChat from './VoiceChat';

interface User {
  id: string;
  name: string;
  isYou?: boolean;
}

interface NavbarProps {
  onlineUsers?: User[];
  roomId?: string;
  username?: string;
  onShowHistory?: () => void;
}

export default function Navbar({ onlineUsers = [], roomId, username = '', onShowHistory }: NavbarProps) {
  const router = useRouter();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setIsSettingsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);

      setIsSettingsDropdownOpen(false);
    }
  };

  const leaveRoom = () => {
    if (confirm('Are you sure you want to leave this room?')) {
      router.push('/dashboard');
    }
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: CodeSync Brand Name */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Code</span>
            <span className="text-blue-400">Sync</span>
          </h1>
        </div>

        {/* Right: Voice Chat, Settings & Online Users */}
        <div className="flex items-center gap-3">
          {/* Voice Chat */}
          {roomId && username && (
            <VoiceChat roomId={roomId} username={username} />
          )}
          {/* Settings Dropdown */}
          {roomId && (
            <div className="relative" ref={settingsDropdownRef}>
              <button
                onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSettingsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Settings Dropdown Menu */}
              {isSettingsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      onShowHistory?.();
                      setIsSettingsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 hover:bg-slate-600 transition-colors flex items-center gap-3 text-left"
                  >
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white text-sm font-medium">Version History</span>
                  </button>

                  <button
                    onClick={copyRoomId}
                    className="w-full px-4 py-3 hover:bg-slate-600 transition-colors flex items-center gap-3 text-left border-t border-slate-600"
                  >
                    <Copy className="w-5 h-5 text-emerald-400" />
                    <span className="text-white text-sm font-medium">Copy Room ID</span>
                  </button>

                  <button
                    onClick={leaveRoom}
                    className="w-full px-4 py-3 hover:bg-slate-600 transition-colors flex items-center gap-3 text-left border-t border-slate-600"
                  >
                    <LogOut className="w-5 h-5 text-red-400" />
                    <span className="text-white text-sm font-medium">Leave Room</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Online Users Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">Online Users ({onlineUsers.length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-600 bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <p className="text-sm font-semibold text-white">Online Users ({onlineUsers.length})</p>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {onlineUsers.length > 0 ? (
                    onlineUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-3 hover:bg-slate-600 transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {user.name}
                            {user.isYou && <span className="ml-2 text-xs text-emerald-400">(You)</span>}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      No other users online
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
