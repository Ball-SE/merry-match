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
    // ดึง packages ทั้งหมดที่ stripe_product_id เป็น NULL
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .is('stripe_product_id', null);

    if (error) throw error;

    const results = [];

    for (const pkg of packages || []) {
      console.log(`Creating Stripe product for package: ${pkg.name}`);

      // สร้าง Product ใน Stripe
      const product = await stripe.products.create({
        name: pkg.name,
        description: `Merry Match Package: ${pkg.name}${pkg.details ? ` - ${pkg.details.join(', ')}` : ''}`,
        metadata: {
          package_id: pkg.id.toString(),
          type: 'merry_package'
        }
      });

      // สร้าง Price (ใช้ราคา default 599 บาท)
      const price = await stripe.prices.create({
        unit_amount: 59900, // 599 บาท
        currency: 'thb',
        product: product.id,
        metadata: {
          package_id: pkg.id.toString(),
          package_name: pkg.name
        }
      });

      // อัปเดต database
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          stripe_product_id: product.id,
          stripe_price_id: price.id
        })
        .eq('id', pkg.id);

      if (updateError) {
        console.error('Error updating package:', updateError);
        throw updateError;
      }

      results.push({
        packageId: pkg.id,
        packageName: pkg.name,
        stripeProductId: product.id,
        stripePriceId: price.id,
        status: 'created'
      });
    }

    res.status(200).json({
      message: `Successfully synced ${results.length} packages`,
      results
    });
  } catch (error: unknown) {
    console.error('Error syncing packages:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}