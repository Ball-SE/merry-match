import { supabase } from '../lib/supabase/supabaseClient';

export interface Message {
  id: string;
  created_at: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  message_type?: 'text' | 'image' | 'emoji'; // ทำให้เป็น optional
  is_read?: boolean; // ทำให้เป็น optional
  read_at?: string;
  sender?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

export interface MatchWithProfile {
  id: string;
  matched_at: string;
  user1_id: string;
  user2_id: string;
  user1?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
  user2?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

export class ChatService {
  // ส่งข้อความ
  async sendMessage(matchId: string, messageText: string, messageType: 'text' | 'image' | 'emoji' = 'text'): Promise<Message> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // หา match และตรวจสอบว่า user เป็นส่วนหนึ่งของ match หรือไม่
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error('Match not found');
    }

    if (match.user1_id !== user.id && match.user2_id !== user.id) {
      throw new Error('Not authorized to send message to this match');
    }

    const receiverId = match.user1_id === user.id ? match.user2_id : match.user1_id;

    // สร้าง object สำหรับ insert โดยตรวจสอบคอลัมน์ที่มีอยู่
    const messageData: {
      match_id: string;
      sender_id: string;
      receiver_id: string;
      message_text: string;
      message_type?: 'text' | 'image' | 'emoji';
    } = {
      match_id: matchId,
      sender_id: user.id,
      receiver_id: receiverId,
      message_text: messageText
    };

    // เพิ่ม message_type เฉพาะเมื่อมีคอลัมน์นี้
    try {
      const { data: testData, error: testError } = await supabase
        .from('messages')
        .select('message_type')
        .limit(1);
      
      if (!testError) {
        messageData.message_type = messageType;
      }
    } catch (error) {
      console.log('message_type column not found, skipping...');
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, photo_url)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return message as Message;
  }

  // ดึงข้อความใน match
  async getMessages(matchId: string, limit: number = 50): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, photo_url)
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return messages as Message[];
  }

  // ดึง matches ที่มีข้อความ
  async getMatchesWithMessages(): Promise<MatchWithProfile[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(id, name, photo_url),
        user2:profiles!matches_user2_id_fkey(id, name, photo_url)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('matched_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return matches as MatchWithProfile[];
  }

  // อัพเดทสถานะการอ่านข้อความ
  async markAsRead(messageId: string): Promise<void> {
    try {
      // ลองตรวจสอบว่าคอลัมน์ is_read และ read_at มีอยู่หรือไม่
      const { data: testData, error: testError } = await supabase
        .from('messages')
        .select('is_read, read_at')
        .limit(1);
      
      if (testError) {
        console.log('is_read or read_at columns not found, skipping mark as read...');
        return;
      }

      const updateData: {
        is_read?: boolean;
        read_at?: string;
      } = {};
      
      // เพิ่ม is_read เฉพาะเมื่อมีคอลัมน์นี้
      if (testData && testData.length > 0) {
        updateData.is_read = true;
        updateData.read_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) {
        throw new Error(`Failed to mark message as read: ${error.message}`);
      }
    } catch (error) {
      console.log('Error in markAsRead:', error);
      // ไม่ throw error เพื่อไม่ให้แอปหยุดทำงาน
    }
  }

  // Subscribe เพื่อรับข้อความใหม่แบบ real-time
  subscribeToMessages(matchId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        callback(payload.new as Message);
      })
      .subscribe();
  }

  // Subscribe เพื่อรับข้อความใหม่ทั้งหมด
  async subscribeToAllMessages(callback: (message: Message) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return supabase
      .channel('all-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`
      }, (payload) => {
        callback(payload.new as Message);
      })
      .subscribe();
  }
}

export const chatService = new ChatService();