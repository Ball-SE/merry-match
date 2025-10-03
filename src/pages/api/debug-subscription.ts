// Debug endpoint เพื่อตรวจสอบปัญหา subscription
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

    // สร้าง Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // 1. ตรวจสอบ User Authentication
    const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !user) {
      return res.status(401).json({ 
        error: "Invalid token",
        details: getUserErr 
      });
    }

    // 2. ตรวจสอบ Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', user.id)
      .single();

    // 3. ตรวจสอบ Subscriptions ทั้งหมด (ไม่จำกัด status)
    const { data: allSubscriptions, error: allSubsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    // 4. ตรวจสอบ Active Subscriptions
    const { data: activeSubscriptions, error: activeSubsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // 5. ตรวจสอบ Packages
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*');

    // 6. ตรวจสอบ Subscription with Joins
    const { data: subscriptionWithJoins, error: joinsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        package_id,
        status,
        current_period_start,
        current_period_end,
        profiles(id, name),
        packages(id, name, daily_swipe_limit)
        `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    res.status(200).json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email,
          authenticated: true
        },
        profile: {
          data: profile,
          error: profileError,
          exists: !!profile
        },
        subscriptions: {
          all: {
            data: allSubscriptions,
            error: allSubsError,
            count: allSubscriptions?.length || 0
          },
          active: {
            data: activeSubscriptions,
            error: activeSubsError,
            count: activeSubscriptions?.length || 0
          },
          withJoins: {
            data: subscriptionWithJoins,
            error: joinsError
          }
        },
        packages: {
          data: packages,
          error: packagesError,
          count: packages?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error 
    });
  }
}

