// src/modules/products/product.route.ts
import { Router } from 'express';
import { ProductController } from './product.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new ProductController();

router.get('/', controller.getProducts);
router.get('/:slug', controller.getProductBySlug);
router.post('/:id/track', controller.trackClick);

// Proteksi endpoint pembuatan produk
router.post('/', verifyAuth, controller.createProduct);

export default router;