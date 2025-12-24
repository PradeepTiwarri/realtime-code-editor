'use client';

import { useState, ReactNode } from 'react';
import RoomForm from './Roomform';
import { useUserStore } from '@/stores/userStore';
import { Play } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  roomId: string;
}

interface Props {
  /** Extra Tailwind classes supplied by the parent */
  className?: string;
  /** Optional children to render inside the button */
  children?: ReactNode;
}

export default function CreateRoomButton({ className = '', children }: Props): React.JSX.Element {
  const user = useUserStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);

  const handleFormSubmit = async (formData: FormData): Promise<void> => {
    try {
      // 1. Create room
      const res = await fetch('http://localhost:5000/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          roomId: formData.roomId,
          createdBy: user?.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create room');

      // 2. Join room
      await fetch('http://localhost:5000/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: formData.roomId, userId: user?.id }),
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className={className || `
          px-6 py-3 rounded-lg bg-blue-600 text-white font-medium
          hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
        `}
      >
        {children || (
          <>
            <Play className="w-5 h-5" />
            <span>Create Room</span>
          </>
        )}
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl text-gray-500 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
            <RoomForm onSubmit={handleFormSubmit} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}
