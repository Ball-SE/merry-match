import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// เพิ่ม Type Definitions
interface PackageData {
  name: string;
  price: number;
}

interface SubscriptionData {
  id: number;
  created_at: string;
  status: string;
  current_period_start: string;
  packages: PackageData | null;
}

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

    // ดึงประวัติการชำระเงินจาก subscriptions table โดยเรียงจากใหม่สุดไปเก่าสุด
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        created_at,
        status,
        current_period_start,
        packages (
          name,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (subscriptionsError) {
      console.error('Error fetching billing history:', subscriptionsError);
      return res.status(500).json({ error: 'Failed to fetch billing history' });
    }

    // แปลงข้อมูลเป็นรูปแบบที่ง่ายต่อการใช้งาน - ใช้ double assertion
    const billingHistory = (subscriptions as unknown as SubscriptionData[])
      ?.filter(sub => sub.status === 'active' || sub.status === 'cancelled')
      .map(sub => ({
        id: sub.id,
        date: sub.created_at,
        package: sub.packages?.name || 'Unknown',
        amount: sub.packages?.price || 0,
        status: sub.status
      })) || [];

    res.status(200).json({ 
      success: true, 
      billingHistory 
    });
  } catch (error) {
    console.error('Error in billing history API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}