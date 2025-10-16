import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
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

  if (req.method === 'POST') {
    // Join chat room
    const { match_id } = req.body;
    if (!match_id) {
      return res.status(400).json({ error: 'match_id required' });
    }

    const { error } = await supabase
      .from('user_active_chats')
      .upsert({
        user_id: user.id,
        match_id,
        last_active_at: new Date().toISOString()
      }, { onConflict: 'user_id,match_id' });

    if (error) {
      console.error('[chat-presence] Error joining chat:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[chat-presence] User ${user.id} joined chat ${match_id}`);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    // Heartbeat - update last_active_at
    const { match_id } = req.body;
    if (!match_id) {
      return res.status(400).json({ error: 'match_id required' });
    }

    const { error } = await supabase
      .from('user_active_chats')
      .update({ last_active_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('match_id', match_id);

    if (error) {
      console.error('[chat-presence] Error updating heartbeat:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    // Leave chat room
    const { match_id } = req.query;
    if (!match_id) {
      return res.status(400).json({ error: 'match_id required' });
    }

    const { error } = await supabase
      .from('user_active_chats')
      .delete()
      .eq('user_id', user.id)
      .eq('match_id', match_id);

    if (error) {
      console.error('[chat-presence] Error leaving chat:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[chat-presence] User ${user.id} left chat ${match_id}`);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

