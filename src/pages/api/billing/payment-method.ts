import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/stripeServer';

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

    // ดึง stripe_customer_id จาก profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return res.status(200).json({ 
        success: true, 
        paymentMethod: null 
      });
    }

    // ดึง payment methods จาก Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      return res.status(200).json({ 
        success: true, 
        paymentMethod: null 
      });
    }

    // ส่งข้อมูล payment method ตัวแรก (ถ้ามีหลายตัวสามารถส่งทั้งหมดได้)
    const pm = paymentMethods.data[0];
    const card = pm.card;

    const paymentMethod = {
      id: pm.id,
      brand: card?.brand || 'unknown',
      last4: card?.last4 || '0000',
      expMonth: card?.exp_month || 0,
      expYear: card?.exp_year || 0,
    };

    res.status(200).json({ 
      success: true, 
      paymentMethod 
    });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({ error: 'Failed to fetch payment method' });
  }
}