"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";

interface Message {
  sender: string;
  text: string;
  timestamp?: string;
}

interface User {
  id: string;
  name: string;
}

export default function ChatSidebar({ id, name }: User) {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    console.log("🔌 Joining room:", roomId, "with user:", { id, name });

    socket.emit("JOIN_ROOM", { roomId, user: { id, name } });

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
      socket.emit("JOIN_ROOM", { roomId, user: { id, name } });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("CHAT_MESSAGE", (message) => {
      console.log("💬 Received message:", message);
      setMessages((prev) => [...prev, { ...message, timestamp: new Date().toLocaleTimeString() }]);
    });

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.emit("LEAVE_ROOM", { roomId, userId: id });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("CHAT_MESSAGE");
    };
  }, [roomId, id, name]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const messageData = { roomId, text: input, sender: name };
    console.log("📤 Sending message:", messageData);
    
    socket.emit("CHAT_MESSAGE", messageData);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-gray-900 text-white w-full h-full flex flex-col">
      {/* Connection Status */}
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Chat Messages - Completely hidden scrollbars */}
      <div 
        className="flex-1 p-4 space-y-3"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onScroll={() => {}} // Prevent any scroll events from bubbling
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          💬 Chat Messages
        </h3>
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-start justify-between mb-1">
                <span className="font-semibold text-blue-400 text-sm truncate pr-2">
                  {msg.sender}
                  {msg.sender === name && <span className="text-gray-500 ml-1">(You)</span>}
                </span>
                {msg.timestamp && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">{msg.timestamp}</span>
                )}
              </div>
              <p className="text-white text-sm leading-relaxed break-all">{msg.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700 transition-colors text-white placeholder-gray-400"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected}
            className="bg-blue-600 px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Disconnected - Cannot send messages
          </p>
        )}
      </div>
    </div>
  );
}
