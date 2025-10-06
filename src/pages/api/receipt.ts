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
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { subscriptionId } = req.body;

    // ดึงข้อมูล subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages (name, price)
      `)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // ดึง payment intent id ที่เก็บไว้
    const paymentIntentId = subscription.stripe_subscription_id; // จริงๆ เก็บเป็น payment_intent_id

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'No payment record found' });
    }

    // ดึง PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // ดึง Charge จาก PaymentIntent
    const chargeId = paymentIntent.latest_charge;
    
    if (!chargeId) {
      return res.status(400).json({ error: 'No charge found for this payment' });
    }

    // ดึงข้อมูล Charge เพื่อเข้าถึง receipt_url
    const charge = await stripe.charges.retrieve(chargeId as string);

    // ส่ง Receipt URL กลับไป
    return res.status(200).json({
      success: true,
      receiptUrl: charge.receipt_url, // หน้าเว็บ receipt (สามารถ print เป็น PDF ได้)
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      created: new Date(charge.created * 1000).toISOString(),
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ 
      error: 'Failed to generate receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}