import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // รับ Bearer token จาก header
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    // สร้าง Supabase client ที่ผูกกับ token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // ดึงข้อมูล user จาก token
    const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // ดึง subscription ปัจจุบันที่ active
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    if (!currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // ตรวจสอบว่า subscription ถูก cancel ไปแล้วหรือยัง
    if (currentSubscription.cancel_at_period_end) {
      return res.status(400).json({ 
        error: 'Subscription is already scheduled for cancellation',
        cancel_at: currentSubscription.cancel_at 
      });
    }

    // อัพเดทให้ cancel ที่ period end แทนการยกเลิกทันที
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: true,
        cancel_at: currentSubscription.current_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id);

    if (updateError) {
      console.error('Error cancelling subscription:', updateError);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      cancel_at: currentSubscription.current_period_end
    });
  } catch (error) {
    console.error('Error in cancel subscription API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}