import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe/stripeServer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, description, price, currency = 'thb' } = req.body;

    // สร้าง Product
    const product = await stripe.products.create({
      name: name,
      description: description,
      metadata: {
        type: 'merry_package'
      }
    });

    // สร้าง Price สำหรับ Product
    const priceObj = await stripe.prices.create({
      unit_amount: price * 100, // convert to cents
      currency: currency,
      product: product.id,
      metadata: {
        package_name: name
      }
    });

    res.status(200).json({
      productId: product.id,
      priceId: priceObj.id,
      product: product,
      price: priceObj
    });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}