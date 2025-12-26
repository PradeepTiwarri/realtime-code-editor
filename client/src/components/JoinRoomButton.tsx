'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import JoinRoomModal from './JoinRoomModal';
import { useUserStore } from '@/stores/userStore';
import { Users } from 'lucide-react';

interface Props {
  /** Extra Tailwind classes supplied by the parent */
  className?: string;
  /** Optional children to render inside the button */
  children?: ReactNode;
}

export default function JoinRoomButton({ className = '', children }: Props): React.JSX.Element {
  const user = useUserStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleJoin = async (roomId: string): Promise<void> => {
    // Ensure we use the correct environment variable
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

    try {
      await fetch(`${SERVER_URL}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, roomId }),
      });
      
      // Navigate to the room
      router.push(`/room/${roomId}`);
      
    } catch (err) {
      console.error("Failed to join room:", err);
      // Optional: Add error handling/toast notification here
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className || `
          px-6 py-3 rounded-lg bg-blue-600 text-white font-medium
          hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2 shadow-sm
        `}
      >
        {children || (
          <>
            <Users className="w-5 h-5" />
            <span>Join Room</span>
          </>
        )}
      </button>

      {/* Conditional Rendering of the Modal */}
      {showModal && (
        <JoinRoomModal onClose={() => setShowModal(false)} onJoin={handleJoin} />
      )}
    </>
  );
}