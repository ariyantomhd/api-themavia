// src/modules/dashboard/dashboard.route.ts
import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Semua rute dashboard wajib melewati verifikasi token
router.use(verifyAuth);

// Rute utama /api/dashboard/ (mengambil data overview)
router.get('/', DashboardController.getOverview);

// Rute spesifik sub-menu
router.get('/overview', DashboardController.getOverview);
router.get('/purchases', DashboardController.getPurchases);
router.get('/downloads', DashboardController.getDownloads);
router.put('/profile', DashboardController.updateProfile);

export default router;