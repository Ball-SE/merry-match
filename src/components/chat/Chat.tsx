import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { LuPaperclip, LuSend, LuLoader, LuX } from 'react-icons/lu';
import { Heart } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/lib/supabase/supabaseClient';
import { uploadChatPhoto } from '@/lib/supabase/uploadPhotoUtils';

type ChatProps = {
  matchId: string;
}

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string | null;
  message_type?: 'text' | 'image';
  media_url?: string | null;
  created_at: string;
  is_read: boolean;
}

function Chat({ matchId }: ChatProps) {
  const [user, setUser] = useState<{ id: string; user_metadata?: { avatar_url?: string } } | null>(null);
  const { messages, match, loading, error, sendMessage } = useChat(matchId);
  const [newMessage, setNewMessage] = useState('');
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const isLoadingRef = useRef(false);
  const isInitialScrollRef = useRef(false); // ป้องกัน auto-load หลัง mount
  
  // States สำหรับการส่งรูปภาพ
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state เมื่อเปลี่ยน matchId
  useEffect(() => {
    console.log('🔄 Resetting for new matchId:', matchId);
    setAllMessages([]);
    setHasMore(true);
    setOldestMessageId(null);
    setLoadingMore(false);
    isLoadingRef.current = false;
    isInitialScrollRef.current = false; // Reset flag สำหรับ chat ใหม่
  }, [matchId]);

  // อัปเดต allMessages เมื่อ messages จาก hook เปลี่ยน
  useEffect(() => {
    if (messages && messages.length > 0) {
      // กรองเฉพาะข้อความที่เป็นของ match นี้
      const messagesForThisMatch = messages.filter((m: Message) => m.match_id === matchId);
      
      // ตรวจสอบว่ามีข้อความใหม่หรือไม่
      const newMessageIds = messagesForThisMatch.map((m: Message) => m.id);
      const existingIds = allMessages.map(m => m.id);
      
      // ถ้ามีข้อความใหม่ที่ไม่อยู่ใน allMessages ให้เพิ่มเข้าไป
      const hasNewMessages = newMessageIds.some((id: string) => !existingIds.includes(id));
      
      if (hasNewMessages || allMessages.length === 0) {
        // รวมข้อความเก่ากับใหม่ โดยไม่ให้ซ้ำกัน
        const combined = [...allMessages];
        messagesForThisMatch.forEach((msg: Message) => {
          if (!combined.find(m => m.id === msg.id)) {
            combined.push(msg);
          }
        });
        
        // เรียงตามเวลา
        combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setAllMessages(combined);
        
        // Scroll to bottom เมื่อมีข้อความใหม่
        setTimeout(() => {
          if (messagesContainerRef.current) {
            // ใช้ instant scroll เพื่อไม่ให้ trigger scroll event
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            console.log('📍 Auto scrolled to bottom after loading messages');
            
            // ตั้ง flag เพื่อป้องกัน auto-load ในช่วงสั้นๆหลัง scroll
            isInitialScrollRef.current = true;
            setTimeout(() => {
              isInitialScrollRef.current = false;
              console.log('🟢 Initial scroll completed, load-more enabled');
            }, 300); // ลดเวลาเหลือ 300ms
          }
        }, 100); // ลดเวลา delay
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, matchId]);

  // ตั้งค่า oldestMessageId เมื่อ allMessages เปลี่ยน
  useEffect(() => {
    if (allMessages.length > 0) {
      const sorted = [...allMessages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const newOldestId = sorted[0]?.id || null;
      setOldestMessageId(newOldestId);
    }
  }, [allMessages]);

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

  // โหลดข้อความเก่าเพิ่มเติม
  const loadMoreMessages = useCallback(async () => {
    console.log('📥 loadMoreMessages called', { loadingMore, hasMore, oldestMessageId });
    
    if (loadingMore || !hasMore || !oldestMessageId) {
      console.log('❌ Skipped:', { loadingMore, hasMore, oldestMessageId });
      return;
    }

    console.log('🚀 Starting to load more messages...');
    setLoadingMore(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setLoadingMore(false);
        return;
      }

      // เก็บ scroll position ปัจจุบัน
      if (messagesContainerRef.current) {
        previousScrollHeight.current = messagesContainerRef.current.scrollHeight;
      }

      const response = await fetch(
        `/api/messages?match_id=${matchId}&limit=20&before_message_id=${oldestMessageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newMessages: Message[] = data.messages || [];
        
        console.log('📦 Received messages:', newMessages.length, 'hasMore:', data.pagination?.hasMore);
        
        if (newMessages.length > 0) {
          // เพิ่มข้อความเก่าเข้าไปข้างหน้า
          const combined = [...newMessages, ...allMessages];
          
          // เรียงตามเวลา
          combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          setAllMessages(combined);
          setHasMore(data.pagination?.hasMore || false);
          
          console.log('✅ Messages updated, total:', combined.length);

          // คืน scroll position
          setTimeout(() => {
            if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              const scrollDiff = newScrollHeight - previousScrollHeight.current;
              messagesContainerRef.current.scrollTop = scrollDiff;
              console.log('📍 Scroll position restored:', scrollDiff);
              
              // Reset loading flag หลังจาก scroll position ถูกคืนค่าแล้ว
              setTimeout(() => {
                isLoadingRef.current = false;
                console.log('🏁 Loading flag reset, ready for next load');
              }, 200);
            }
          }, 100);
        } else {
          console.log('⚠️ No more messages');
          setHasMore(false);
          // Reset flag เมื่อไม่มีข้อความแล้ว
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 100);
        }
      } else {
        console.error('❌ API error:', response.status);
        // Reset flag เมื่อเกิด error
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 100);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      // Reset flag เมื่อเกิด error
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 100);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, oldestMessageId, matchId, allMessages]);

  // ตรวจสอบ scroll position เพื่อโหลดข้อความเก่า
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    // ป้องกันการ load ข้อความในช่วงที่กำลัง auto-scroll หลัง mount
    if (isInitialScrollRef.current) {
      console.log('🔒 Initial scroll in progress, skip load-more');
      return;
    }
    
    // ป้องกันการเรียกซ้ำๆ
    if (isLoadingRef.current) {
      console.log('⏸️ Already loading, skip');
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

    console.log('Scroll event:', { 
      scrollTop, 
      scrollHeight, 
      clientHeight,
      hasMore, 
      loadingMore, 
      messagesCount: allMessages.length 
    });

    // ถ้า scroll ถึงด้านบน (scrollTop น้อยกว่า 200px)
    if (scrollTop < 200 && hasMore && !loadingMore && allMessages.length > 0) {
      console.log('✅ Triggering loadMoreMessages');
      isLoadingRef.current = true;
      
      // Call loadMoreMessages
      // Flag จะถูก reset ภายใน loadMoreMessages หลังจาก scroll position ถูกคืนค่าแล้ว
      loadMoreMessages();
    }
  }, [hasMore, loadingMore, loadMoreMessages, allMessages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // จัดการเลือกรูปภาพ
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบ file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // ตรวจสอบ file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.');
      return;
    }

    setSelectedImage(file);
    
    // สร้าง preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ยกเลิกการเลือกรูปภาพ
  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ส่งข้อความ
  const handleSendMessage = async () => {
    // ถ้ามีรูปที่เลือกไว้ ให้ส่งรูปอย่างเดียว (ไม่มี caption)
    if (selectedImage && user?.id) {
      setUploadingImage(true);
      try {
        // อัปโหลดรูปไปที่ Supabase Storage
        const result = await uploadChatPhoto(selectedImage, user.id);
        
        if (!result.success || !result.url) {
          alert(result.error || 'Failed to upload image');
          return;
        }

        // ส่งเฉพาะรูปภาพ (ไม่มี caption)
        await sendMessage('', 'image', result.url);
        
        // รีเซ็ต state
        handleCancelImage();
      } catch (error) {
        console.error('Error uploading/sending image:', error);
        alert('Failed to send image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    }
    // ถ้าไม่มีรูป แต่มีข้อความ ให้ส่งข้อความปกติ
    else if (newMessage.trim()) {
      try {
        await sendMessage(newMessage, 'text');
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

  // ฟังก์ชันสำหรับ format วันที่เป็นภาษาอังกฤษ (สากล)
  const formatDateDivider = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    messageDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Format: DD/MM/YYYY
      return messageDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // ฟังก์ชันเช็คว่าข้อความควรแสดง date divider หรือไม่
  const shouldShowDateDivider = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.created_at);
    const previousDate = new Date(previousMessage.created_at);

    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    return currentDate.getTime() !== previousDate.getTime();
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
    <div className="h-full min-h-0 flex flex-col bg-[#160404] relative overflow-hidden">
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
      <div 
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-12 pb-4 space-y-3 md:space-y-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
        }}
      >
        {/* Loading indicator ด้านบน */}
        {loadingMore && (
          <div className="flex justify-center py-3">
            <div className="flex items-center gap-2 text-gray-400">
              <LuLoader className="animate-spin" size={20} />
              <span className="text-sm">Loading earlier messages...</span>
            </div>
          </div>
        )}

        {/* แสดงข้อความเมื่อไม่มีข้อความเก่าแล้ว */}
        {!hasMore && allMessages.length > 0 && (
          <div className="flex justify-center py-3">
            <span className="text-xs text-gray-500">No more messages</span>
          </div>
        )}

        {/* Messages */}
        {allMessages.map((message, index) => {
          const isCurrentUser = message.sender_id === user?.id;
          const previousMessage = index > 0 ? allMessages[index - 1] : null;
          const showDateDivider = shouldShowDateDivider(message, previousMessage);
          
          return (
            <div key={message.id}>
              {/* Date Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-4 md:my-6">
                  <div className="bg-[#2A2439] text-white text-xs md:text-sm px-4 py-2 rounded-full">
                    {formatDateDivider(message.created_at)}
                  </div>
                </div>
              )}

              {/* Message */}
              <div
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
                  {/* แสดงรูปภาพถ้าเป็น message type image */}
                  {message.message_type === 'image' && message.media_url ? (
                    <>
                      <Image
                        src={message.media_url}
                        alt="Shared image"
                        width={300}
                        height={300}
                        className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.media_url || '', '_blank')}
                      />
                      <p className={`text-xs opacity-70 mt-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </>
                  ) : (
                    /* แสดงข้อความธรรมดา */
                    <>
                      <p className="text-xs md:text-sm break-words">{message.message_text}</p>
                      <p className={`text-xs opacity-70 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>          

      {/* Message Input */}
      <div className="bg-[#160404] border-t border-[#424C6B] px-4 md:px-12 py-4 md:py-6">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Preview"
                width={200}
                height={200}
                className="rounded-xl max-h-40 w-auto object-cover"
              />
              <button
                onClick={handleCancelImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={uploadingImage}
              >
                <LuX size={16} />
              </button>
            </div>
            {uploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                <LuLoader className="animate-spin text-white" size={24} />
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {/* Paperclip Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || selectedImage !== null}
            className="p-1.5 md:p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <LuPaperclip size={18} className="md:w-5 md:h-5" />
          </button>
          
          {/* Text Input - ซ่อนเมื่อมีรูปที่เลือก */}
          {!selectedImage && (
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message here..."
                disabled={uploadingImage}
                className="w-full bg-transparent text-white placeholder-[#9B9EAD] rounded-2xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#C70039] focus:ring-opacity-50"
              />
            </div>
          )}
          
          {/* Spacer เมื่อมีรูป */}
          {selectedImage && <div className="flex-1"></div>}
          
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || uploadingImage}
            className="w-8 h-8 md:w-10 md:h-10 bg-[#C70039] rounded-full flex items-center justify-center hover:bg-[#C2185B] transition-colors"
          >
            {uploadingImage ? (
              <LuLoader className="animate-spin text-white" size={16} />
            ) : (
              <LuSend size={16} className="text-white md:w-[18px] md:h-[18px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
