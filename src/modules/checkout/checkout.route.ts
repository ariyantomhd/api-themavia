// src/modules/checkout/checkout.route.ts
import { Router } from 'express';
import { CheckoutController } from './checkout.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', verifyAuth, CheckoutController.checkout);

export const checkoutRoutes = router;