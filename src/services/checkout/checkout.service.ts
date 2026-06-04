import { supabaseAdmin } from '@/lib/supabase/admin';
import { CheckoutItemInput, CreateIntentInput } from '@/types/marketplace';

export class CheckoutService {
  /**
   * Securely creates a payment intent by fetching absolute prices from the database.
   * Completely bypasses any price parameters sent from the frontend to prevent tampering.
   */
  static async createPaymentIntent(input: CreateIntentInput) {
    const { userId, items, couponCode } = input;

    if (!items || items.length === 0) {
      throw new Error('Checkout cart cannot be empty.');
    }

    let calculatedTotalPrice = 0;
    const verifiedProductIds: string[] = [];

    // Strictly loop and verify each item pricing directly from the database vault
    for (const item of items as CheckoutItemInput[]) {
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('id, price, regular_price, extended_price, discount_price')
        .eq('id', item.productId)
        .single();

      if (error || !product) {
        throw new Error(`Product verification failed for ID: ${item.productId}`);
      }

      // Base price evaluation from secure database records
      let activePrice = Number(product.price || 0);

      if (item.priceType === 'extended_price' && product.extended_price) {
        activePrice = Number(product.extended_price);
      } else if (item.priceType === 'regular_price' && product.regular_price) {
        activePrice = Number(product.regular_price);
      }

      // Overwrite with flash sale promotional price if active and valid
      if (product.discount_price && Number(product.discount_price) > 0) {
        activePrice = Number(product.discount_price);
      }

      calculatedTotalPrice += activePrice;
      verifiedProductIds.push(product.id);
    }

    // Process promotional discount code strictly on server-side logic
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from('coupons')
        .select('discount_percent, is_active, expiry_date')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (!couponError && coupon && coupon.is_active) {
        const now = new Date();
        const expiry = new Date(coupon.expiry_date);
        
        if (expiry > now) {
          const discountAmount = (calculatedTotalPrice * Number(coupon.discount_percent)) / 100;
          calculatedTotalPrice = calculatedTotalPrice - discountAmount;
        }
      }
    }

    // Guard against floating-point fractional rounding errors
    const finalAmount = Math.round(calculatedTotalPrice * 100) / 100;

    // Create a secure pending order record in the database ledger
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: userId,
          product_ids: verifiedProductIds,
          total_price: finalAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      throw new Error('Failed to lock order state inside gateway registry.');
    }

    return {
      orderId: order.id,
      totalAmount: finalAmount,
      currency: 'USD',
      status: order.status,
    };
  }
}