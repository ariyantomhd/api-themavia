import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';

export class CheckoutController {
  static async checkout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Dari middleware auth
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { shipping_address, notes } = req.body;
      const result = await CheckoutService.processCheckout(userId, shipping_address, notes);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          order: result.order,
          items: result.items,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}