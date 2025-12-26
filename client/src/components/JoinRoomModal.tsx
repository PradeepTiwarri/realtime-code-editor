'use client'

import { useState } from "react";

interface JoinRoomModalProps {
  onClose: () => void;
  onJoin: (roomId: string) => void;
}

export default function JoinRoomModal({ onClose, onJoin }: JoinRoomModalProps) {
  const [roomId, setRoomId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomId.trim()) {
      onJoin(roomId);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md transform transition-all">
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Join a Room</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomId" className="block text-sm font-semibold text-gray-900 mb-2">
              Room ID
            </label>
            <input 
              id="roomId"
              type="text" 
              placeholder="Enter Room ID" 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)} 
              /* Updated Class: 
                 - text-gray-900 for visible typing
                 - bg-white for clean background
                 - placeholder:text-gray-500 for visible placeholder
              */
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}