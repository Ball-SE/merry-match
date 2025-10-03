import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/stripeServer';

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

    const { packageId, paymentIntentId, amount } = req.body;

    // ตรวจสอบราคาของ package ที่จะสมัคร และดึง daily_swipe_limit
    const { data: newPackage, error: packageError } = await supabase
      .from('packages')
      .select('price, daily_swipe_limit')
      .eq('id', packageId)
      .single();

    if (packageError || !newPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // ตรวจสอบว่า user มี subscription ที่ active อยู่หรือไม่
    const { data: currentSubscription } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages (
          price
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // ถ้ามี subscription ปัจจุบัน ให้ตรวจสอบว่าไม่ใช่การ downgrade
    if (currentSubscription && currentSubscription.packages) {
      const currentPrice = currentSubscription.packages.price;
      const newPrice = newPackage.price;

      if (newPrice < currentPrice) {
        return res.status(400).json({ 
          error: 'Cannot downgrade to a lower-priced package',
          message: 'Please cancel your current subscription before subscribing to a lower-priced package'
        });
      }

      // ถ้าเป็นการ upgrade ให้ยกเลิก subscription เก่าก่อน
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', currentSubscription.id);
    }
    
    // ตรวจสอบว่ามี customer แล้วหรือยัง
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      // สร้าง customer ใหม่
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.name,
        metadata: {
          supabase_user_id: user.id
        }
      });
      
      stripeCustomerId = customer.id;

      // บันทึก customer id ใน profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // บันทึก subscription ใน table subscriptions ที่มีอยู่แล้ว
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        package_id: packageId,
        stripe_subscription_id: paymentIntentId,
        stripe_customer_id: stripeCustomerId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        merry_limit: newPackage.daily_swipe_limit, // เพิ่มบรรทัดนี้
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      throw subscriptionError;
    }

    // บันทึก payment history
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: amount * 100,
        status: 'succeeded'
      });

    if (paymentError) {
      console.error('Payment error:', paymentError);
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}