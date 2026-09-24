// src/modules/auth/auth.route.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { verifyAuth } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.get('/verify', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.post('/logout', verifyAuth, AuthController.logout);

// Daftarkan endpoint /getme dan /me agar kompatibel dengan pemanggilan frontend
router.get('/getme', verifyAuth, AuthController.getMe);
router.get('/me', verifyAuth, AuthController.getMe);

router.post('/reset-password', AuthController.resetPassword);
router.post('/update-password', AuthController.updatePassword);

export default router;