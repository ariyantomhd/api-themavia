import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface CapturePayload {
  paypalOrderId: string;
}

interface OrderRecord {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: string;
  affiliate_code: string | null;
}

interface AffiliateLinkRecord {
  user_id: string;
  conversions: number;
}

interface ProductCommissionRecord {
  commission_rate: number | null;
}

/**
 * POST: Captures the authorized PayPal transaction, finalizes internal billing rows, and distributes affiliate splits.
 * Accessible via: POST /api/v1/checkout/capture
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request Identity
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session signature expired or invalid.');
    }

    const body = (await req.json()) as CapturePayload;
    const { paypalOrderId } = body;

    if (!paypalOrderId) {
      return ApiResponseHelper.badRequest('Missing mandatory paypalOrderId parameter.');
    }

    // 2. Fetch the local pending order matching this PayPal Tracking ID
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, product_id, amount, status, affiliate_code')
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (orderError || !orderData) {
      return ApiResponseHelper.notFound('No matching internal order record found for this transaction token.');
    }

    const currentOrder = orderData as OrderRecord;

    // Idempotency check: prevent multi-capture operations on already completed invoices
    if (currentOrder.status === 'paid') {
      return ApiResponseHelper.success({ orderId: currentOrder.id }, 'This transaction has already been captured and processed.', 200);
    }

    // 3. Authenticate and request Capture sequence from PayPal Engine
    const paypalAuth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch(`${process.env.PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${paypalAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error('PayPal server access handshake collapsed during payment liquidation.');
    }

    const tokenData = await tokenResponse.json();
    const paypalAccessToken = tokenData.access_token;

    // Execute capture fetch
    const captureResponse = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paypalAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!captureResponse.ok) {
      throw new Error('PayPal gateway declined to release funds. Capture protocol aborted.');
    }

    const captureData = await captureResponse.json();

    // Double check PayPal execution state block
    if (captureData.status !== 'COMPLETED') {
      return ApiResponseHelper.badRequest('Payment settlement authorization is incomplete or flagged by PayPal.');
    }

    // 4. Update internal order state ledger to PAID
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', currentOrder.id);

    if (updateOrderError) {
      throw new Error('Payment received but failed to unlock assets within our data engine core.');
    }

    // 5. 💸 AUTOMATION ENGINE: Distribute affiliate revenue cut if link tracking code exists
    if (currentOrder.affiliate_code) {
      // Look up who owns the affiliate code and what the baseline product rate slice is
      const { data: linkData } = await supabaseAdmin
        .from('affiliate_links')
        .select('user_id, conversions')
        .eq('code', currentOrder.affiliate_code)
        .maybeSingle();

      const affiliateLink = linkData as AffiliateLinkRecord | null;

      if (affiliateLink) {
        const { data: productData } = await supabaseAdmin
          .from('products')
          .select('commission_rate')
          .eq('id', currentOrder.product_id)
          .maybeSingle();

        const productInfo = productData as ProductCommissionRecord | null;
        const commissionRate = productInfo?.commission_rate ?? 10; // Default flat 10%
        
        const commissionEarned = (currentOrder.amount * commissionRate) / 100;

        // Log the exact affiliate payout entry logs atomically
        await supabaseAdmin.from('affiliate_earnings').insert([
          {
            affiliate_id: affiliateLink.user_id,
            order_id: currentOrder.id,
            amount: commissionEarned,
            commission_rate: commissionRate,
            created_at: new Date().toISOString(),
          },
        ]);

        // Inject the freshly brewed cash into the affiliate's liquid balance account profile
        const { data: profileRow } = await supabaseAdmin
          .from('profiles')
          .select('affiliate_balance')
          .eq('id', affiliateLink.user_id)
          .single();

        const activeBalance = profileRow?.affiliate_balance ?? 0;

        await supabaseAdmin
          .from('profiles')
          .update({ affiliate_balance: activeBalance + commissionEarned })
          .eq('id', affiliateLink.user_id);

        // Update the link metrics conversion incremental counters
        await supabaseAdmin
          .from('affiliate_links')
          .update({ conversions: (affiliateLink.conversions || 0) + 1 })
          .eq('code', currentOrder.affiliate_code);
      }
    }

    // 6. Access granted payload! Backbridge layer can now safely reveal the digital download node asset
    return ApiResponseHelper.success(
      { orderId: currentOrder.id, paymentState: 'COMPLETED' },
      'Payment verified and settled. Internal ledgers updated and assets unlocked successfully.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Critical system crash inside payment capture sequence.';
    return ApiResponseHelper.badRequest(message);
  }
}