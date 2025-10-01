import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe/stripeServer';
import { buffer } from 'micro';
import { supabase } from '@/lib/supabase/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  try {
    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // อัปเดตสถานะ payment ใน table payments
        await supabase
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // อัปเดตสถานะ payment ใน table payments
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', failedPayment.id);

        // อัปเดตสถานะ subscription เป็น inactive
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('stripe_subscription_id', failedPayment.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err}`);
  }
}