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
        stripe_subscription_id: paymentIntentId, // ใช้ payment intent id แทน subscription id
        stripe_customer_id: stripeCustomerId, // จะอัปเดตภายหลังถ้าต้องการ
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      throw subscriptionError;
    }

    // บันทึก payment history ใน table payments ที่มีอยู่แล้ว
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: amount * 100, // convert to cents
        status: 'succeeded'
      });

    if (paymentError) {
      console.error('Payment error:', paymentError);
      // ไม่ throw error เพราะ subscription สำเร็จแล้ว
    }

    res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}