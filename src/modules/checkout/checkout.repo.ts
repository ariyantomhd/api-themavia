import { supabaseAdmin } from '../../lib/supabase/admin';

export class CheckoutRepository {
  static async getCartWithItems(userId: string) {
    // Ambil cart beserta item dan data produk (harga, dll)
    const { data: cart, error: cartError } = await supabaseAdmin
      .from('carts')
      .select(`
        id,
        user_id,
        cart_items (
          id,
          product_id,
          quantity,
          products (id, price, stock)
        )
      `)
      .eq('user_id', userId)
      .single();

    if (cartError && cartError.code !== 'PGRST116') throw new Error(cartError.message);
    return cart;
  }

  static async createOrder(userId: string, totalAmount: number, shippingAddress?: string, notes?: string) {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: userId,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        notes: notes,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return order;
  }

  static async createOrderItems(items: { order_id: string; product_id: string; quantity: number; price: number }[]) {
    const { error } = await supabaseAdmin.from('order_items').insert(items);
    if (error) throw new Error(error.message);
  }

  static async clearCart(cartId: string) {
    // Hapus cart items
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId);
    // Hapus cart utama
    await supabaseAdmin.from('carts').delete().eq('id', cartId);
  }
}