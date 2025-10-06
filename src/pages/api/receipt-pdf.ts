import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/stripeServer';
import PDFDocument from 'pdfkit';

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

    // ดึงข้อมูล subscription และ profile
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        packages (name, price, details)
      `)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single();

    // ดึงข้อมูล Stripe Charge
    const paymentIntentId = subscription.stripe_subscription_id;
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'No payment record found' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const chargeId = paymentIntent.latest_charge;
    
    if (!chargeId) {
      return res.status(400).json({ error: 'No charge found' });
    }

    const charge = await stripe.charges.retrieve(chargeId as string);

    // สร้าง PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${subscriptionId}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // --- Header ---
    doc.fontSize(28)
       .fillColor('#C70039')
       .text('MERRY MATCH', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(20)
       .fillColor('#333333')
       .text('Payment Receipt', { align: 'center' });

    doc.moveDown(1.5);
    
    // Line separator
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor('#E4E6ED')
       .stroke();

    doc.moveDown(1);

    // --- Receipt Details ---
    const receiptDate = new Date(charge.created * 1000);
    const formattedDate = receiptDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    doc.fontSize(12).fillColor('#646D89');
    
    // Left column
    const leftX = 50;
    const rightX = 350;
    let currentY = doc.y;

    doc.text('Receipt Number:', leftX, currentY);
    doc.fillColor('#2A2E3F').text(`#${subscriptionId}`, leftX + 120, currentY);
    
    currentY += 25;
    doc.fillColor('#646D89').text('Date:', leftX, currentY);
    doc.fillColor('#2A2E3F').text(formattedDate, leftX + 120, currentY);
    
    currentY += 25;
    doc.fillColor('#646D89').text('Customer:', leftX, currentY);
    doc.fillColor('#2A2E3F').text(profile?.name || 'N/A', leftX + 120, currentY);
    
    currentY += 25;
    doc.fillColor('#646D89').text('Email:', leftX, currentY);
    doc.fillColor('#2A2E3F').text(profile?.email || user.email || 'N/A', leftX + 120, currentY);

    currentY += 25;
    doc.fillColor('#646D89').text('Payment Status:', leftX, currentY);
    doc.fillColor('#28a745').text(charge.status.toUpperCase(), leftX + 120, currentY);

    doc.moveDown(3);

    // Line separator
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor('#E4E6ED')
       .stroke();

    doc.moveDown(1);

    // --- Item Details ---
    doc.fontSize(14).fillColor('#2A2E3F').text('Package Details', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(16).fillColor('#A62D82').text(subscription.packages.name);
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#646D89').text(subscription.packages.details?.join(' • ') || 'Premium membership benefits');

    doc.moveDown(1.5);

    // --- Amount ---
    doc.fontSize(12).fillColor('#646D89');
    
    const priceY = doc.y;
    doc.text('Subtotal:', leftX, priceY);
    doc.text(`THB ${(charge.amount / 100).toFixed(2)}`, rightX, priceY, { align: 'right' });

    doc.moveDown(0.5);

    // Line separator
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor('#E4E6ED')
       .stroke();

    doc.moveDown(0.5);

    // Total
    const totalY = doc.y;
    doc.fontSize(16).fillColor('#2A2E3F');
    doc.text('Total Paid:', leftX, totalY);
    doc.fontSize(18).fillColor('#C70039');
    doc.text(`THB ${(charge.amount / 100).toFixed(2)}`, rightX, totalY, { align: 'right' });

    doc.moveDown(2);

    // Line separator
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor('#E4E6ED')
       .stroke();

    doc.moveDown(1);

    // --- Footer ---
    doc.fontSize(10).fillColor('#888888');
    doc.text('Thank you for your purchase!', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).text('For questions, please contact support@merrymatch.com', { align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#AAAAAA');
    doc.text(`Stripe Charge ID: ${charge.id}`, { align: 'center' });
    doc.text(`Payment Intent ID: ${paymentIntentId}`, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    
    // ถ้า PDF ยังไม่ได้ส่งออกไป ให้ส่ง error JSON
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate receipt PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}