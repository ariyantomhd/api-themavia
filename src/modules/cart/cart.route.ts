// src/modules/cart/cart.route.ts
import { Router } from 'express';
import { CartController } from './cart.controller';
import { verifyAuth } from '../../middlewares/auth.middleware'; // Diaktifkan

const router = Router();
const controller = new CartController();

// Terapkan middleware auth di semua rute keranjang agar butuh login
router.use(verifyAuth);

router.get('/', controller.getCart);
router.post('/', controller.addToCart);
router.delete('/:id', controller.removeItem);
router.delete('/', controller.clearCart);

export default router;