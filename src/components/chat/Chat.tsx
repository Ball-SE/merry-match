import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LuPaperclip, LuSend } from 'react-icons/lu';
import { Heart } from 'lucide-react';

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: 'user' | 'other';
  timestamp: Date;
}

interface ChatProps {
  matchName?: string;
  userAvatar?: string;
  otherUserAvatar?: string;
}

const Chat: React.FC<ChatProps> = ({ 
  matchName = "Daeny", 
  userAvatar = "/assets/daeny.png",
  otherUserAvatar = "/assets/ygritte.png"
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi',
      sender: 'user',
      timestamp: new Date()
    },
    {
      id: '2',
      text: 'Do you like ma dragons?',
      sender: 'user',
      timestamp: new Date()
    },
    {
      id: '3',
      image: '/assets/dragons.jpg', // You'll need to add this image
      sender: 'user',
      timestamp: new Date()
    },
    {
      id: '4',
      text: 'Yep, they\'re cool...',
      sender: 'other',
      timestamp: new Date()
    },
    {
      id: '5',
      text: 'But i like u better 😉😍',
      sender: 'other',
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
                            Now you and {matchName} are Merry Match!
                        </p>
                        <p className="text-[#95002B] text-xs md:text-sm font-medium">
                            You can messege something nice and make a good conversation. Happy Merry!
                        </p>
                    </div>
                </div>
            </div>
        </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-2 py-6 md:px-8 pb-4 space-y-3 md:space-y-4 flex flex-col justify-end">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'} items-end gap-2`}
          >
            {message.sender === 'user' && (
              <div className="w-8 h-8 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={userAvatar}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div
              className={`max-w-[70%] md:max-w-xs lg:max-w-md px-3 md:px-6 py-4 rounded-3xl ${
                message.sender === 'user'
                  ? 'bg-[#EFC4E2] text-black rounded-bl-none'
                  : 'bg-[#7D2262] text-white rounded-br-none'
              }`}
            >
              {message.text && (
                <p className="text-xs md:text-sm break-words">{message.text}</p>
              )}
              {message.image && (
                <div className="mt-2">
                  <Image
                    src={message.image}
                    alt="Message image"
                    width={200}
                    height={150}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                </div>
              )}
            </div>

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>          

      {/* Message Input */}
      <div className="bg-[#160404] p-2 border-t border-[#424C6B] md:px-8 md:py-6">
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
