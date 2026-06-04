import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { CheckoutService } from '@/services/checkout/checkout.service';
import { CreateIntentInput } from '@/types/marketplace'; // 🌟 Fixed: Imported straight from types registry

/**
 * POST: Initiates a secure payment intent channel.
 * Validates the authenticated buyer session, processes database-locked pricing calculations,
 * and responds with a standardized gateway order registration payload.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication Check: Ensure only logged-in users can initiate purchases
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session expired or invalid. Please re-authenticate.');
    }

    const body = await req.json();
    const { items, couponCode } = body;

    // Basic structure checking before forwarding to the core logic engine
    if (!items || !Array.isArray(items) || items.length === 0) {
      return ApiResponseHelper.badRequest('Checkout item cart cannot be empty or invalid.');
    }

    // 2. Formulate secure service payloads using types inferred from our marketplace registry
    const checkoutPayload: CreateIntentInput = {
      userId: user.id,
      items,
      couponCode,
    };

    // 3. Delegate to the secure checkout service (Prices are pulled strictly from DB here)
    const secureOrderIntent = await CheckoutService.createPaymentIntent(checkoutPayload);

    return ApiResponseHelper.success(
      secureOrderIntent,
      'Secure payment intent initialized successfully.',
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to register the requested purchase intent.';
    return ApiResponseHelper.badRequest(message);
  }
}