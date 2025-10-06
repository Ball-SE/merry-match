import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe/stripeServer';
import { supabase } from '@/lib/supabase/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'thb', packageId } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] as string; // รับ idempotency key

    // ตรวจสอบว่ามี Payment Intent ที่สร้างด้วย key นี้แล้วหรือไม่
    if (idempotencyKey) {
      const existingPayments = await stripe.paymentIntents.list({
        limit: 10,
      });
      
      const existingPayment = existingPayments.data.find(
        pi => pi.metadata.idempotencyKey === idempotencyKey
      );
      
      if (existingPayment) {
        return res.status(200).json({
          clientSecret: existingPayment.client_secret,
        });
      }
    }

    // ดึงข้อมูล package
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // สร้าง Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types: ['card'],
      setup_future_usage: 'off_session', //บอก Stripe ว่าเราต้องการใช้ payment method นี้อีกในอนาคต
      metadata: {
        packageId: packageId.toString(),
        packageName: packageData.name,
        stripeProductId: packageData.stripe_product_id || '',
        stripePriceId: packageData.stripe_price_id || '',
        idempotencyKey: idempotencyKey || '', // เก็บ idempotency key
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      productId: packageData.stripe_product_id,
      priceId: packageData.stripe_price_id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}