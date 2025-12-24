"use client";

import { useEffect, useState, useRef } from "react";
import socket from "@/lib/socket";
import { useParams } from "next/navigation";
import { Send, X } from "lucide-react";

interface Message {
  sender: string;
  text: string;
  timestamp?: string;
}

interface User {
  id: string;
  name: string;
}

interface ChatSidebarProps extends User {
  onClose?: () => void;
}

export default function ChatSidebar({ id, name, onClose }: ChatSidebarProps) {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;

    console.log("🔌 Joining room:", roomId, "with user:", name);

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Send username directly to match backend expectations
    socket.emit("JOIN_ROOM", { roomId, username: name });

    // Connection handlers
    const handleConnect = () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
      socket.emit("JOIN_ROOM", { roomId, username: name });
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    };

    const handleChatHistory = (history: Message[]) => {
      console.log("📜 Received chat history:", history);
      setMessages(history);
    };

    const handleChatMessage = (message: Message) => {
      console.log("💬 Received message:", message);
      setMessages((prev) => [...prev, message]);
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("CHAT_HISTORY", handleChatHistory);
    socket.on("CHAT_MESSAGE", handleChatMessage);

    // Set initial connection state
    if (socket.connected) {
      setIsConnected(true);
    }

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.emit("LEAVE_ROOM", { roomId, userId: id });
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("CHAT_HISTORY", handleChatHistory);
      socket.off("CHAT_MESSAGE", handleChatMessage);
    };
  }, [roomId, id, name]);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Only send roomId and text - backend uses socket.username
    const messageData = { roomId, text: input.trim() };
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
    <div className="w-80 h-full bg-slate-800 flex flex-col">
      {/* Header with Connection Status and Close Button */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            💬 Chat Messages
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700 text-gray-400 hover:text-white rounded transition-colors"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Connection Status Bar */}
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-gray-400">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1e293b'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="font-semibold">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMyMessage = msg.sender === name;
            
            return (
              <div 
                key={index} 
                className={`rounded-lg p-3 space-y-1 ${
                  isMyMessage 
                    ? 'bg-emerald-700 ml-8' 
                    : 'bg-slate-700 mr-8'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm ${
                    isMyMessage ? 'text-emerald-100' : 'text-blue-400'
                  }`}>
                    {msg.sender}
                    {isMyMessage && (
                      <span className="ml-1 text-xs text-emerald-300">(You)</span>
                    )}
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  )}
                </div>
                <p className="text-white text-sm break-words">{msg.text}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700 transition-colors text-white placeholder-gray-400"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        {!isConnected && (
          <div className="mt-2 text-xs text-red-400 text-center">
            Disconnected - Cannot send messages
          </div>
        )}
      </div>
    </div>
  );
}
