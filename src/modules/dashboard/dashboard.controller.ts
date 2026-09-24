// src/modules/dashboard/dashboard.controller.ts
import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const data = await DashboardService.getDashboardOverview(userId);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPurchases(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await DashboardService.getPurchases(userId);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDownloads(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await DashboardService.getDownloads(userId);
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const updated = await DashboardService.updateUserSettings(userId, req.body);
      return res.status(200).json({ success: true, message: 'Profil berhasil diperbarui', data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}