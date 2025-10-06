import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // ดึงข้อมูล subscription จาก table subscriptions
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        package_id,
        status,
        merry_limit,
        current_period_start,
        current_period_end
        `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      throw subscriptionError;
    }

    if (!subscription) {
      return res.status(200).json({ 
        success: true, 
        subscription: null,
        message: "No active subscription found"
      });
    }

    // ดึงข้อมูล profile และ package แยก
    const [profileResult, packageResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name')
        .eq('id', subscription.user_id)
        .single(),
      supabase
        .from('packages')
        .select('id, name, daily_swipe_limit')
        .eq('id', subscription.package_id)
        .single()
    ]);

    // จัดรูปแบบข้อมูลให้ตรงกับที่ frontend ต้องการ
    const formattedSubscription = {
      id: subscription.id,
      user: {
        id: profileResult.data?.id || subscription.user_id,
        name: profileResult.data?.name || 'Unknown User'
      },
      package: {
        id: packageResult.data?.id || subscription.package_id,
        name: packageResult.data?.name || 'Unknown Package',
        daily_swipe_limit: packageResult.data?.daily_swipe_limit || 0
      },
      merry_limit: subscription.merry_limit,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end
    };

    res.status(200).json({ success: true, subscription: formattedSubscription });
  } catch (error) {
    console.error('Error get subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
}