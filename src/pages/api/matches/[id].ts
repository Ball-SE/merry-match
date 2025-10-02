import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!id) {
      return res.status(400).json({ error: 'Match ID is required' });
    }

    try {
      const auth = req.headers.authorization || "";
      const token = auth.replace(/^Bearer\s+/i, "");
      if (!token) return res.status(401).json({ error: "Missing bearer token" });

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }


      // ดึงข้อมูล match ก่อน (ใช้ service role)
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();


      if (matchError || !match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // ตรวจสอบว่า user มีสิทธิ์เข้าถึง match นี้หรือไม่
      if (match.user1_id !== user.id && match.user2_id !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // ดึงข้อมูล profiles แยก
      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
      const { data: otherUser, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, photo_url, username')
        .eq('id', otherUserId)
        .single();

      if (profileError || !otherUser) {
        return res.status(404).json({ error: 'Other user not found' });
      }

      return res.status(200).json({ 
        match: {
          id: match.id,
          matched_at: match.matched_at,
          status: match.status,
          other_user: otherUser
        }
      });
    } catch (error) {
      console.error('Error in match API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
