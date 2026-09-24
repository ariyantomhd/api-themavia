// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, message: 'All fields (email, password, fullName) are required.' });
      }
      const result = await AuthService.register({ email, password, fullName });
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, message: 'Verification token missing.' });
      }

      // 1. Jalankan proses verifikasi di service (mengubah status user di DB menjadi terverifikasi)
      const result = await AuthService.verifyEmail(token);

      // Ambil token akses atau data sesi hasil verifikasi dari service
      // (Pastikan AuthService.verifyEmail mengembalikan data token/session atau user session)
      const accessToken = (result as any)?.accessToken || (result as any)?.token || token;

      // 2. Tentukan URL Frontend Next.js (bisa disesuaikan dengan environment variable Abang)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // 3. Redirect user ke halaman frontend dengan membawa token agar langsung login otomatis
      return res.redirect(`${frontendUrl}/auth/success?token=${accessToken}`);
    } catch (error: any) {
      // Jika verifikasi gagal (token invalid/expired), redirect ke halaman login frontend dengan pesan error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = encodeURIComponent(error.message || 'Verification failed');
      return res.redirect(`${frontendUrl}/auth/login?error=${errorMessage}`);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }
      const result = await AuthService.login(email, password, req);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const result = await AuthService.getMe(userId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(400).json({ success: false, message: 'No token provided.' });

      const token = authHeader.split(' ')[1];
      const result = await AuthService.logout(token);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

      const result = await AuthService.resetPassword(email);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updatePassword(req: Request, res: Response) {
    try {
      const { accessToken, newPassword } = req.body;
      if (!accessToken || !newPassword) {
        return res.status(400).json({ success: false, message: 'AccessToken and newPassword are required.' });
      }

      const result = await AuthService.updatePassword(accessToken, newPassword);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}