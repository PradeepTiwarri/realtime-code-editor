'use client';

import { useState } from 'react';
import RoomForm from './Roomform';
import { useUserStore } from '@/stores/userStore';

interface FormData {
  name: string;
  description: string;
  roomId: string;
}
interface Props {
  /** Extra Tailwind classes supplied by the parent */
  className?: string;
}

export default function CreateRoomButton({ className = '' }: Props): React.JSX.Element {
  const user = useUserStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);

  const handleFormSubmit = async (formData: FormData): Promise<void> => {
    try {
      // 1. create room
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

      // 2. join room
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
        type="button"
        onClick={() => setShowForm(true)}
        className={`
          rounded-lg bg-blue-600 text-white font-medium
          hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        + Create Room
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end p-4 pb-0">
              <button
                aria-label="Close"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl text-gray-500"
              >
                ×
              </button>
            </div>

            <RoomForm onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}
