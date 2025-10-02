import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // ดึงข้อความจาก match_id
    const { match_id } = req.query;
    
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

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
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

      // ดึงข้อความทั้งหมดของ match นี้
      const { data: messages, error: messagesError } = await supabase
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
        .eq('match_id', match_id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error in messages API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // ส่งข้อความใหม่
    const { match_id, message_text, receiver_id } = req.body;

    if (!match_id || !message_text || !receiver_id) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          match_id,
          sender_id: user.id,
          receiver_id,
          message_text,
          is_read: false
        })
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
