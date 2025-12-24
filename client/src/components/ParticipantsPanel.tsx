'use client';

import React from 'react';

interface Participant {
  id: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatarUrl: string;
}

interface ParticipantsPanelProps {
  roomId: string;
}

// Dummy participants for now
const dummyParticipants: Participant[] = [
  {
    id: '1',
    name: 'Pradeep Tiwari',
    role: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '2',
    name: 'John Doe',
    role: 'Editor',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '3',
    name: 'Jane Smith',
    role: 'Viewer',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
  },
];

export default function ParticipantsPanel({ roomId }: ParticipantsPanelProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Participants</h2>
      <ul className="space-y-4">
        {dummyParticipants.map((user) => (
          <li key={user.id} className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
