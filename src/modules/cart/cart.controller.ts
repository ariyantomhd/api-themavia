// src/modules/cart/cart.controller.ts
import { Request, Response } from 'express';
import { CartService } from './cart.service';

export class CartController {
  private service: CartService;

  constructor() {
    this.service = new CartService();
  }

  getCart = async (req: any, res: Response) => {
    try {
      const userId = req.user?.id || req.userId; // Disesuaikan dengan middleware auth Anda
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const cart = await this.service.getUserCart(userId);
      return res.status(200).json({ success: true, data: cart });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  addToCart = async (req: any, res: Response) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { product_id, quantity } = req.body;
      if (!product_id) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      const item = await this.service.addToCart(userId, product_id, quantity || 1);
      return res.status(200).json({ success: true, message: 'Product added to cart', data: item });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  removeItem = async (req: any, res: Response) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params; // cart_item id
      const result = await this.service.removeFromCart(userId, id);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  clearCart = async (req: any, res: Response) => {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await this.service.clearUserCart(userId);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}