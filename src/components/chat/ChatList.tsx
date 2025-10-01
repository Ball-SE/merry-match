import React, { useState, useEffect } from 'react';
import { chatService, MatchWithProfile } from '@/services/chatService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { User } from '@supabase/supabase-js';

interface ChatListProps {
  onSelectMatch: (match: MatchWithProfile) => void;
}

export default function ChatList({ onSelectMatch }: ChatListProps) {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // ดึงข้อมูล user ใน useEffect
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const matchesData = await chatService.getMatchesWithMessages();
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const getOtherUser = (match: MatchWithProfile) => {
    if (!user) return null;
    return match.user1_id === user.id ? match.user2 : match.user1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>
      
      <div className="overflow-y-auto">
        {matches.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No matches yet</p>
            <p className="text-sm">Start swiping to find your match!</p>
          </div>
        ) : (
          matches.map((match) => {
            const otherUser = getOtherUser(match);
            return (
              <div
                key={match.id}
                onClick={() => onSelectMatch(match)}
                className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {otherUser?.photo_url && (
                    <img
                      src={otherUser.photo_url}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {otherUser?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Matched {new Date(match.matched_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}