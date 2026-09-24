// src/modules/licenses/license.route.ts
import { Router } from 'express';
import { LicenseController } from './license.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint dashboard library user yang sudah dibeli (GET /api/licenses/library)
router.get('/library', verifyAuth, LicenseController.getMyLibrary as any);

// Endpoint tracking/verifikasi nomor seri lisensi (POST /api/licenses/verify)
router.post('/verify', LicenseController.verifyLicense as any);

export const licenseRoutes = router;