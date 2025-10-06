import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface PackageData {
  daily_swipe_limit: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ป้องกันการเรียกจากภายนอก - ใช้ secret token
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // ใช้ service role key
    );

    // ดึง subscriptions ทั้งหมดที่ต้อง reset
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, package_id, packages(daily_swipe_limit)')
      .eq('status', 'active');

    if (fetchError) throw fetchError;

    // Update merry_limit สำหรับทุก subscription
    const updates = subscriptions?.map(async (sub) => {
      const dailyLimit = Array.isArray(sub.packages)
        ? sub.packages[0]?.daily_swipe_limit
        : (sub.packages as PackageData)?.daily_swipe_limit;

      return supabase
        .from('subscriptions')
        .update({
          merry_limit: dailyLimit || 10,
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);
    });

    await Promise.all(updates || []);

    return res.status(200).json({
      success: true,
      message: `Reset ${subscriptions?.length} subscriptions`,
    });
  } catch (error) {
    console.error('Reset cron error:', error);
    return res.status(500).json({ error: 'Failed to reset limits' });
  }
}