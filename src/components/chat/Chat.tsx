import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LuPaperclip, LuSend } from 'react-icons/lu';
import { Heart } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/lib/supabase/supabaseClient';

interface ChatProps {
  matchId: string;
}

const Chat: React.FC<ChatProps> = ({ matchId }) => {
  const [user, setUser] = useState<{ id: string; user_metadata?: { avatar_url?: string } } | null>(null);
  const { messages, match, loading, error, sendMessage } = useChat(matchId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ดึงข้อมูล user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    getUser();
  }, []);


  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await sendMessage(newMessage);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#160404]">
        <div className="text-white">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#160404]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="h-full flex items-center justify-center bg-[#160404]">
        <div className="text-white">Match not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#160404] relative">
        {/* Match Notification Modal */}
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-8 md:pt-16 pointer-events-none">
            <div className="bg-[#F4EBF2] border border-[#DF89C6] rounded-2xl px-6 md:px-13 py-3 md:py-4 max-w-2xl w-full mx-4 animate-fade-in-out">
                <div className="flex items-center gap-4">
                    {/* Heart Icons */}
                    <div className="flex relative w-8 h-8 flex-shrink-0 mr-4">
                        <Heart color="#ff1659" fill="#ff1659" className="absolute" />
                        <Heart 
                            color="#ff1659" 
                            fill="#ff1659" 
                            stroke="#9B9EAD" 
                            strokeWidth={1} 
                            size={28} 
                            className="relative left-3.5 bottom-0.5" 
                        />
                    </div>

                    {/* Text block */}
                    <div className="flex flex-col flex-1">
                        <p className="text-[#95002B] text-xs md:text-sm font-medium">
                            Now you and {match.other_user.name} are Merry Match!
                        </p>
                        <p className="text-[#95002B] text-xs md:text-sm font-medium">
                            You can messege something nice and make a good conversation. Happy Merry!
                        </p>
                    </div>
                </div>
            </div>
        </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12 pb-4 space-y-3 md:space-y-4 flex flex-col justify-end">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === user?.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {!isCurrentUser && (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={match.other_user.photo_url || "/assets/user.jpg"}
                    alt="Other User Avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div
                className={`max-w-[50%] px-3 md:px-6 py-4 rounded-3xl ${
                  isCurrentUser
                    ? 'bg-[#7D2262] text-white rounded-br-none'
                    : 'bg-[#EFC4E2] text-black rounded-bl-none'
                }`}
              >
                <p className="text-xs md:text-sm break-all">{message.message_text}</p>
                <p className={`text-xs opacity-70 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>          

      {/* Message Input */}
      <div className="bg-[#160404] p-2 border-t border-[#424C6B] px-4 md:px-12 md:py-6">
        <div className="flex items-center gap-2 md:gap-3">
          <button className="p-1.5 md:p-2 text-gray-400 hover:text-gray-300 transition-colors">
            <LuPaperclip size={18} className="md:w-5 md:h-5" />
          </button>
          
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Messege here..."
              className="w-full text-white placeholder-[#9B9EAD] rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#C70039] focus:ring-opacity-50"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            className="w-8 h-8 md:w-10 md:h-10 bg-[#C70039] rounded-full flex items-center justify-center hover:bg-[#C2185B] transition-colors"
          >
            <LuSend size={16} className="text-white md:w-[18px] md:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
