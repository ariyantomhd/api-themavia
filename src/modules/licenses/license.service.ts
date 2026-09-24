// src/modules/licenses/license.service.ts
import crypto from 'crypto';
import { LicenseRepository } from './license.repo';
import { LicenseType } from '../../types/enums';

export class LicenseService {
  // Generator nomor seri lisensi unik (Format: TMV-XXXX-XXXX-XXXX)
  static generateLicenseKey(): string {
    const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    return `TMV-${segment()}-${segment()}-${segment()}`;
  }

  static async generateLicensesForOrder(
    userId: string, 
    orderId: string, 
    items: { product_id: string; quantity: number; license_type?: LicenseType }[]
  ) {
    const licensesData = items.flatMap(item => {
      const list = [];
      for (let i = 0; i < item.quantity; i++) {
        list.push({
          user_id: userId,
          product_id: item.product_id,
          order_id: orderId,
          license_key: this.generateLicenseKey(),
          license_type: item.license_type || LicenseType.REGULAR,
        });
      }
      return list;
    });

    return await LicenseRepository.createLicenses(licensesData);
  }

  static async getUserLibrary(userId: string) {
    return await LicenseRepository.getLicensesByUserId(userId);
  }

  static async trackLicense(licenseKey: string) {
    const license = await LicenseRepository.getLicenseByKey(licenseKey);
    if (!license) {
      throw new Error('License key not found or invalid.');
    }
    return license;
  }
}