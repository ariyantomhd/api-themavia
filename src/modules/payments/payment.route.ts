// src/modules/payments/payment.route.ts
import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint untuk membuat order pembayaran PayPal (Membutuhkan autentikasi user)
router.post('/paypal/create-order', verifyAuth, PaymentController.createOrder as any);

// Endpoint untuk konfirmasi / capture pembayaran PayPal setelah user melakukan pembayaran
router.post('/paypal/capture-order', verifyAuth, PaymentController.captureOrder as any);

// Endpoint Webhook PayPal (Tanpa auth karena dipanggil langsung oleh server PayPal)
router.post('/webhook', PaymentController.handleWebhook as any);

export const paymentRoutes = router;