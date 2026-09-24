// src/modules/cart/cart.repo.ts
import { supabaseAdmin } from '../../lib/supabase/admin';
import { Cart, CartItem } from '../../types/cart';

export class CartRepository {
  async findByUserId(userId: string): Promise<Cart | null> {
    const { data: cart, error: cartError } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (cartError && cartError.code === 'PGRST116') return null; // Belum ada cart
    if (cartError) throw new Error(cartError.message);

    return cart as Cart;
  }

  async createCart(userId: string): Promise<Cart> {
    const { data, error } = await supabaseAdmin
      .from('carts')
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Cart;
  }

  async getCartItems(cartId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id,
        cart_id,
        product_id,
        quantity,
        created_at,
        products (
          id,
          title,
          slug,
          regular_price,
          discount_price,
          thumbnail_url,
          status
        )
      `)
      .eq('cart_id', cartId);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async addItem(cartId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    // Cek apakah item sudah ada di cart
    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Jika sudah ada, update quantity
      const newQty = existing.quantity + quantity;
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as CartItem;
    } else {
      // Jika belum ada, insert baru
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .insert([{ cart_id: cartId, product_id: productId, quantity }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as CartItem;
    }
  }

  async removeItem(cartItemId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw new Error(error.message);
  }

  async clearCart(cartId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw new Error(error.message);
  }
}