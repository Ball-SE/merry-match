import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from "@supabase/supabase-js";
import { createMessageNotification } from "@/lib/notification/notificationService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // ดึงข้อความจาก match_id พร้อม pagination
    const { match_id, limit = '20', before_message_id } = req.query;
    
    if (!match_id) {
      return res.status(400).json({ error: 'match_id is required' });
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // ตรวจสอบว่า user มีสิทธิ์เข้าถึง match นี้หรือไม่
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', match_id)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (matchError || !match) {
        return res.status(403).json({ error: 'Access denied to this match' });
      }

      // ถ้ามี before_message_id ให้หาข้อความก่อนหน้านั้น
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            name,
            photo_url,
            username
          ),
          receiver:profiles!messages_receiver_id_fkey(
            id,
            name,
            photo_url,
            username
          )
        `)
        .eq('match_id', match_id);

      if (before_message_id && typeof before_message_id === 'string') {
        const { data: beforeMessage } = await supabase
          .from('messages')
          .select('created_at')
          .eq('id', before_message_id)
          .single();

        if (beforeMessage) {
          query = query.lt('created_at', beforeMessage.created_at);
        }
      }

      // Order และ limit (เรียงจากใหม่ไปเก่า แล้วจะกลับทีหลัง)
      const parsedLimit = parseInt(limit as string, 10);
      query = query.order('created_at', { ascending: false }).limit(parsedLimit);

      const { data: messages, error: messagesError } = await query;

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }

      // เรียงข้อความกลับเป็นเก่าไปใหม่
      const sortedMessages = (messages || []).reverse();

      // ตรวจสอบว่ายังมีข้อความเก่าไหม
      const hasMore = messages && messages.length === parsedLimit;

      return res.status(200).json({ 
        messages: sortedMessages,
        pagination: {
          hasMore,
          limit: parsedLimit
        }
      });
    } catch (error) {
      console.error('Error in messages API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // ส่งข้อความใหม่
    const { match_id, message_text, receiver_id, message_type = 'text', media_url, receiver_is_online = false } = req.body;

    // Validate required fields based on message type
    if (!match_id || !receiver_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (message_type === 'text' && !message_text) {
      return res.status(400).json({ error: 'message_text is required for text messages' });
    }

    if (message_type === 'image' && !media_url) {
      return res.status(400).json({ error: 'media_url is required for image messages' });
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // ตรวจสอบว่า user มีสิทธิ์ส่งข้อความใน match นี้หรือไม่
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', match_id)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (matchError || !match) {
        return res.status(403).json({ error: 'Access denied to this match' });
      }

      // ตรวจสอบว่า receiver_id เป็นคู่ match ที่ถูกต้อง
      if (match.user1_id !== receiver_id && match.user2_id !== receiver_id) {
        return res.status(403).json({ error: 'Invalid receiver' });
      }

      // สร้างข้อความใหม่
      const messageData: {
        match_id: string;
        sender_id: string;
        receiver_id: string;
        is_read: boolean;
        message_type: string;
        message_text?: string;
        media_url?: string;
      } = {
        match_id,
        sender_id: user.id,
        receiver_id,
        is_read: false,
        message_type,
      };

      if (message_type === 'text') {
        messageData.message_text = message_text;
      } else if (message_type === 'image') {
        messageData.media_url = media_url;
        if (message_text) messageData.message_text = message_text;
      }

      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            name,
            photo_url,
            username
          ),
          receiver:profiles!messages_receiver_id_fkey(
            id,
            name,
            photo_url,
            username
          )
        `)
        .single();

      if (insertError) {
        console.error('Error inserting message:', insertError);
        return res.status(500).json({ error: 'Failed to send message' });
      }

      // 🔔 สร้าง notification สำหรับผู้รับ (จะถูกฟังแบบ realtime ที่ useNotifications)
      try {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('name, photo_url')
          .eq('id', user.id)
          .single();

        await createMessageNotification(
          receiver_id,                                   // ผู้รับ
          user.id,                                       // ผู้ส่ง
          { name: senderProfile?.name, photo_url: senderProfile?.photo_url },
          match_id,
          (messageData.message_text || '') as string,
          receiver_is_online
        );
      } catch (e) {
        console.error('createMessageNotification error:', e);
      }

      return res.status(201).json({ message: newMessage });
    } catch (error) {
      console.error('Error in messages API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    // อัปเดตสถานะการอ่านข้อความ
    const { message_ids } = req.body;

    if (!message_ids || !Array.isArray(message_ids)) {
      return res.status(400).json({ error: 'message_ids array is required' });
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // อัปเดตสถานะการอ่าน
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', message_ids)
        .eq('receiver_id', user.id);

      if (updateError) {
        console.error('Error updating message read status:', updateError);
        return res.status(500).json({ error: 'Failed to update read status' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in messages API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}