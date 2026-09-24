// src/modules/payments/payment.controller.ts
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

export class PaymentController {
  // 1. Endpoint untuk membuat pesanan PayPal (Mendukung Cart / Multi-Item)
  static async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).userId || (req as any).user?.id;
      const { items } = req.body; // items berupa array: [{ product_id, quantity, price }]

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Items array is required for checkout' });
      }

      const order = await PaymentService.createPayPalOrder(userId, items);

      return res.status(200).json({
        success: true,
        message: 'PayPal order and checkout created successfully',
        data: order,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. Endpoint untuk menangkap/konfirmasi pembayaran PayPal yang sukses
  static async captureOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { paypal_order_id } = req.body;

      if (!paypal_order_id) {
        return res.status(400).json({ success: false, message: 'PayPal order ID is required' });
      }

      const captureResult = await PaymentService.capturePayPalOrder(paypal_order_id);

      return res.status(200).json({
        success: true,
        message: 'Payment captured, verified, and licenses generated successfully',
        data: captureResult,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Endpoint untuk menerima Webhook otomatis dari PayPal
  static async handleWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const event = req.body;

      if (!event || !event.event_type) {
        return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
      }

      await PaymentService.handleWebhookEvent(event);

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook Error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}