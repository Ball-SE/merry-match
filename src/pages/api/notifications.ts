import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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

      const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    // ✨ Resolve fresh photo_url from profiles like Chat does // EDIT
    const ids = Array.from(new Set(
      (notifications || []).flatMap(n => [
        n?.data?.matched_user_id,
        n?.data?.sender_id,
        n?.data?.liker_user_id,  // ✅ เพิ่ม liker_user_id
      ]).filter(Boolean)
    ));

    let profileMap: Record<string, { name?: string; photo_url?: string }> = {};
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', ids as string[]);
      if (profiles) {
        profileMap = Object.fromEntries(profiles.map(p => [p.id, { name: p.name, photo_url: p.photo_url }]));
      }
    }

    const hydrated = (notifications || []).map(n => {
      if (n.type === 'match' && n?.data?.matched_user_id) {
        const p = profileMap[n.data.matched_user_id];
        if (p) {
          n.data.matched_user_name = n.data.matched_user_name || p.name;
          n.data.matched_user_photo = p.photo_url || n.data.matched_user_photo;
        }
      } else if (n.type === 'message' && n?.data?.sender_id) {
        const p = profileMap[n.data.sender_id];
        if (p) {
          n.data.sender_name = n.data.sender_name || p.name;
          n.data.sender_photo = p.photo_url || n.data.sender_photo;
        }
      } else if (n.type === 'like' && n?.data?.liker_user_id) {  // ✅ เพิ่ม case นี้
        const p = profileMap[n.data.liker_user_id];
        if (p) {
          n.data.liker_user_name = n.data.liker_user_name || p.name;
          n.data.liker_user_photo = p.photo_url || n.data.liker_user_photo;
        }
      }
      return n;
    });

    const unreadCount = hydrated.filter(n => !n.is_read).length || 0;

    return res.status(200).json({
      notifications: hydrated,
      unreadCount,
    });
    } catch (error) {
      console.error('Error in notifications API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      const { notification_ids } = req.body;

      if (!notification_ids || !Array.isArray(notification_ids)) {
        return res.status(400).json({ error: 'notification_ids array is required' });
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notification_ids)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating notifications:', error);
        return res.status(500).json({ error: 'Failed to update notifications' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in notifications API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}