import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    name: string;
    photo_url: string;
    username: string;
  };
  receiver?: {
    id: string;
    name: string;
    photo_url: string;
    username: string;
  };
}

interface Match {
  id: string;
  matched_at: string;
  status: string;
  other_user: {
    id: string;
    name: string;
    photo_url: string;
    username: string;
  };
}

interface UseChatReturn {
  messages: Message[];
  match: Match | null;
  loading: boolean;
  error: string | null;
  sendMessage: (messageText: string) => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  unreadCount: number;
}

export const useChat = (matchId: string): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const [session, setSession] = useState<{
    user: { id: string };
    access_token: string;
  } | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  // Reset messages เมื่อเปลี่ยน matchId
  useEffect(() => {
    setMessages([]);
    setMatch(null);
    setUnreadCount(0);
  }, [matchId]);

  // ดึงข้อมูล match
  const fetchMatch = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch match");
      }
      const data = await response.json();
      setMatch(data.match);
    } catch (err) {
      console.error("Error fetching match:", err);
      setError("Failed to load match");
    }
  }, [matchId, session?.access_token]);

  // ดึงข้อความล่าสุด 20 ข้อความ
  const fetchMessages = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      // โหลดแค่ 20 ข้อความล่าสุด
      const response = await fetch(`/api/messages?match_id=${matchId}&limit=20`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages || []);

      // นับข้อความที่ยังไม่ได้อ่าน
      const unread =
        data.messages?.filter(
          (msg: Message) =>
            !msg.is_read && msg.receiver_id === session?.user?.id
        ).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    }
  }, [matchId, session?.access_token, session?.user?.id]);

  // ส่งข้อความ
  const sendMessage = useCallback(async (messageText: string) => {
    if (!match || !session?.user?.id || !session?.access_token) return;

    console.log('Sending message:', {
      matchId,
      messageText,
      receiverId: match.other_user.id,
      senderId: session.user.id
    });

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          match_id: matchId,
          message_text: messageText,
          receiver_id: match.other_user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);

      // ข้อความจะถูกเพิ่มผ่าน realtime subscription
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [match, matchId, session?.user?.id, session?.access_token]);

  // ทำเครื่องหมายว่าอ่านแล้ว
  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!session?.access_token) return;

      try {
        const response = await fetch("/api/messages", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message_ids: messageIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark as read");
        }

        // อัปเดตสถานะใน state
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          )
        );

        // ลดจำนวนข้อความที่ยังไม่ได้อ่าน
        setUnreadCount((prev) => Math.max(0, prev - messageIds.length));
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [session?.access_token]
  );

  // ตั้งค่า realtime subscription
  useEffect(() => {
    if (!matchId || !session?.user?.id || !session?.access_token) {
      console.log('Missing required data for realtime:', { matchId, userId: session?.user?.id, hasToken: !!session?.access_token });
      return;
    }

    console.log('Setting up realtime with:', {
      matchId,
      userId: session.user.id,
      token: session.access_token.substring(0, 20) + '...'
    });

    // สร้าง supabase client ด้วย user context
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      }
    );

    // สร้าง channel สำหรับ match นี้
    console.log('Setting up realtime subscription for match:', matchId);
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          console.log('Realtime INSERT payload:', payload);
          const newMessage = payload.new as Message;
          
          // เพิ่มข้อความใหม่
          setMessages(prev => {
            console.log('Adding new message:', newMessage);
            return [...prev, newMessage];
          });
          
          // ถ้าเป็นข้อความที่ส่งมาหาเรา ให้เพิ่มจำนวน unread
          if (newMessage.receiver_id === session.user.id) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;

          // อัปเดตข้อความ
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred');
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('Channel closed');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [matchId, session?.user?.id, session?.access_token]);

  // เพิ่ม polling เป็น fallback (ถ้า realtime ไม่ทำงาน)
  useEffect(() => {
    if (!matchId || !session?.access_token) return;

    // Poll ทุก 5 วินาที เมื่อหน้าต่าง active
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchMessages();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [matchId, session?.access_token, fetchMessages]);

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      await Promise.all([fetchMatch(), fetchMessages()]);

      setLoading(false);
    };

    loadData();
  }, [fetchMatch, fetchMessages]);

  // ทำเครื่องหมายข้อความที่ยังไม่ได้อ่านเมื่อ component mount
  useEffect(() => {
    if (messages.length > 0 && session?.user?.id) {
      const unreadMessages = messages.filter(
        (msg) => !msg.is_read && msg.receiver_id === session.user.id
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg.id);
        markAsRead(messageIds);
      }
    }
  }, [messages, session?.user?.id, markAsRead]);

  return {
    messages,
    match,
    loading,
    error,
    sendMessage,
    markAsRead,
    unreadCount,
  };
};
