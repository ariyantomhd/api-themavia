// src/modules/cart/cart.service.ts
import { CartRepository } from './cart.repo';

export class CartService {
  private repository: CartRepository;

  constructor() {
    this.repository = new CartRepository();
  }

  async getUserCart(userId: string) {
    let cart = await this.repository.findByUserId(userId);
    if (!cart) {
      cart = await this.repository.createCart(userId);
    }

    const items = await this.repository.getCartItems(cart.id);
    return {
      ...cart,
      items,
    };
  }

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    let cart = await this.repository.findByUserId(userId);
    if (!cart) {
      cart = await this.repository.createCart(userId);
    }

    const item = await this.repository.addItem(cart.id, productId, quantity);
    return item;
  }

  async removeFromCart(userId: string, cartItemId: string) {
    // Pastikan cart milik user yang bersangkutan (bisa ditambahkan validasi kepemilikan jika perlu)
    await this.repository.removeItem(cartItemId);
    return { message: 'Item removed from cart successfully' };
  }

  async clearUserCart(userId: string) {
    const cart = await this.repository.findByUserId(userId);
    if (cart) {
      await this.repository.clearCart(cart.id);
    }
    return { message: 'Cart cleared successfully' };
  }
}