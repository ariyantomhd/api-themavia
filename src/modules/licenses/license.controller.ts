// src/modules/licenses/license.controller.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { LicenseService } from './license.service';

export class LicenseController {
  static async getMyLibrary(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const library = await LicenseService.getUserLibrary(userId);

      return res.status(200).json({
        success: true,
        message: 'User library fetched successfully',
        data: library,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async verifyLicense(req: Request, res: Response): Promise<Response> {
    try {
      const { license_key } = req.body;
      if (!license_key) {
        return res.status(400).json({ success: false, message: 'License key is required' });
      }

      const licenseDetails = await LicenseService.trackLicense(license_key);

      return res.status(200).json({
        success: true,
        message: 'License is valid and active',
        data: licenseDetails,
      });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
}