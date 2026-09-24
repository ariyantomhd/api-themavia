// src/modules/download/download.service.ts
import { DownloadRepository } from './download.repo';
import { DownloadRequestDTO, DownloadResponse } from '../../types/download';
import { LicenseStatus, DownloadStatus } from '../../types/enums';

export class DownloadService {
  private downloadRepo: DownloadRepository;

  constructor() {
    this.downloadRepo = new DownloadRepository();
  }

  async processDownload(dto: DownloadRequestDTO, ipAddress?: string): Promise<DownloadResponse> {
    const license = await this.downloadRepo.findLicenseWithProduct(dto.license_key);

    if (!license) {
      throw new Error('Invalid license key.');
    }

    // Validasi status lisensi
    if (license.status !== LicenseStatus.ACTIVE) {
      throw new Error(`License is not active. Current status: ${license.status}`);
    }

    const product = license.products as any;
    if (!product || !product.file_source_url) {
      throw new Error('Downloadable file not found for this product.');
    }

    // Catat log sukses download
    await this.downloadRepo.createDownloadLog({
      user_id: license.user_id,
      product_id: license.product_id,
      license_id: license.id,
      status: DownloadStatus.SUCCESS,
      ip_address: ipAddress,
    });

    return {
      download_url: product.file_source_url,
      file_name: `${product.title.toLowerCase().replace(/\s+/g, '-')}-file`,
      expires_in: '1 hour',
    };
  }
}