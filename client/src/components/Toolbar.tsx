// components/Toolbar.tsx
'use client';

import { Clock, Copy, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ToolbarProps {
  roomId: string;
  onShowHistory: () => void;
}

export default function Toolbar({ roomId, onShowHistory }: ToolbarProps) {
  const router = useRouter();

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // Optional: Show a toast notification
    alert('Room ID copied to clipboard!');
  };

  const leaveRoom = () => {
    if (confirm('Are you sure you want to leave this room?')) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
      {/* Left Side - Version History */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowHistory}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          title="View Version History"
        >
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Version History</span>
        </button>
      </div>

      {/* Right Side - Copy Room ID & Leave Room */}
      <div className="flex items-center gap-2">
        <button
          onClick={copyRoomId}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          title="Copy Room ID"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Copy Room ID</span>
        </button>

        <button
          onClick={leaveRoom}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Leave Room</span>
        </button>
      </div>
    </div>
  );
}
