import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { CheckoutService } from '@/services/checkout/checkout.service';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CreateIntentInput } from '@/types/marketplace';

export async function POST(req: NextRequest) {
  try {
    // 1. Session Identity Check
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session expired or invalid. Please re-authenticate.');
    }

    const body = await req.json();
    const { items, couponCode, affiliateCode } = body;

    // Basic Structure Validations
    if (!items || !Array.isArray(items) || items.length === 0) {
      return ApiResponseHelper.badRequest('Checkout item cart cannot be empty or invalid.');
    }

    // 2. Delegate to the Secure Checkout Service (Database Locked Pricing)
    const checkoutPayload: CreateIntentInput = {
      userId: user.id,
      items,
      couponCode,
    };
    
    const secureOrderIntent = await CheckoutService.createPaymentIntent(checkoutPayload);

    // 3. Obtain Handshake Access Token from PayPal REST API Engine
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
      throw new Error('Failed to synchronize credentials with PayPal Auth Server.');
    }

    const tokenData = await tokenResponse.json();
    const paypalAccessToken = tokenData.access_token;

    // 4. Dispatch Order Creation Blueprint to PayPal Server Using Secure Intent Amount
    const paypalOrderResponse = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paypalAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: secureOrderIntent.currency,
              value: secureOrderIntent.totalAmount.toFixed(2),
            },
            description: `Themavia Checkout Bundle - Order #${secureOrderIntent.orderId}`,
          },
        ],
      }),
    });

    if (!paypalOrderResponse.ok) {
      throw new Error('PayPal gateway rejected order structure initialization.');
    }

    const paypalOrder = await paypalOrderResponse.json();

    // 5. Update our Internal DB Order Row with the newly minted PayPal Tracking ID and Affiliate Tracking code
    await supabaseAdmin
      .from('orders')
      .update({
        paypal_order_id: paypalOrder.id,
        affiliate_code: affiliateCode || null
      })
      .eq('id', secureOrderIntent.orderId);

    // 6. Return the PayPal Token back to frontend layer
    return ApiResponseHelper.success(
      { 
        orderId: secureOrderIntent.orderId,
        paypalOrderId: paypalOrder.id 
      },
      'Secure payment intent initialized and bound to PayPal context successfully.',
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout transaction fatal initialization collapse.';
    return ApiResponseHelper.badRequest(message);
  }
}