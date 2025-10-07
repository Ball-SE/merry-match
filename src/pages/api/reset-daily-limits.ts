import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase/suapabaseServer';

interface PackageData {
  daily_swipe_limit: number;
}

// ✅ เพิ่ม interface สำหรับ subscription ที่มี packages
interface SubscriptionWithPackage {
  id: string;
  package_id: string;
  packages: PackageData | PackageData[] | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // ✅ แยก token ออกมาเปรียบเทียบแทน
  const envSecret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.authorization?.trim();
  
  // Extract token from "Bearer TOKEN"
  const receivedToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
  
  console.log('🔑 Env Secret:', envSecret);
  console.log('📨 Received Token:', receivedToken);
  console.log('✅ Match:', receivedToken === envSecret);
  
  // ป้องกันการเรียกจากภายนอก
  if (!envSecret || receivedToken !== envSecret) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      debug: {
        hasEnvSecret: !!envSecret,
        hasReceivedToken: !!receivedToken,
        tokensMatch: receivedToken === envSecret
      }
    });
  }

  try {
    const supabase = getSupabaseAdmin(); 

    // ดึง subscriptions ทั้งหมดที่ต้อง reset
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, package_id, packages(daily_swipe_limit)')
      .eq('status', 'active');

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active subscriptions to reset',
        count: 0
      });
    }

    console.log(`Found ${subscriptions.length} active subscriptions to reset`);

    // Update merry_limit สำหรับทุก subscription
    // ✅ Cast แบบนี้จะไม่มีสีแดง
    const updates = (subscriptions as SubscriptionWithPackage[]).map(async (sub) => {
      // ✅ Handle ทั้ง object และ array
      let dailyLimit = 10;
      
      if (sub.packages) {
        if (Array.isArray(sub.packages)) {
          dailyLimit = sub.packages[0]?.daily_swipe_limit || 10;
        } else {
          dailyLimit = sub.packages.daily_swipe_limit || 10;
        }
      }

      console.log(`Resetting subscription ${sub.id} to limit: ${dailyLimit}`);

      return supabase
        .from('subscriptions')
        .update({
          merry_limit: dailyLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);
    });

    const results = await Promise.all(updates);
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Some updates failed:', errors);
    }

    console.log(`✅ Successfully reset ${subscriptions.length} subscriptions`);

    return res.status(200).json({
      success: true,
      message: `Reset ${subscriptions.length} subscriptions`,
      count: subscriptions.length,
      errors: errors.length
    });
  } catch (error) {
    console.error('Reset cron error:', error);
    return res.status(500).json({ 
      error: 'Failed to reset limits',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}