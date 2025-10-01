import React, { useState, useEffect, useRef } from 'react';
import { chatService, Message, MatchWithProfile } from '@/services/chatService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { User } from '@supabase/supabase-js';

interface ChatWindowProps {
  match: MatchWithProfile;
  onClose: () => void;
}

export default function ChatWindow({ match, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  // ดึงข้อมูล user ใน useEffect
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // ดึงข้อความเมื่อ component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesData = await chatService.getMessages(match.id);
        setMessages(messagesData);
        
        // Mark messages as read
        const unreadMessages = messagesData.filter(msg => 
          msg.receiver_id === user?.id && !msg.is_read
        );
        
        for (const message of unreadMessages) {
          await chatService.markAsRead(message.id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [match.id, user?.id]);

  // Subscribe เพื่อรับข้อความใหม่
  useEffect(() => {
    const subscription = chatService.subscribeToMessages(match.id, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      
      // Auto mark as read if it's for current user
      if (newMessage.receiver_id === user?.id) {
        chatService.markAsRead(newMessage.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [match.id, user?.id]);

  // Auto scroll ไปข้อความล่าสุด
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(match.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherUser = () => {
    if (!user) return null;
    return match.user1_id === user.id ? match.user2 : match.user1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          {otherUser?.photo_url && (
            <img
              src={otherUser.photo_url}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser?.name}</h3>
            <p className="text-sm text-gray-500">
              Matched {new Date(match.matched_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === user?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.message_text}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}