// src/modules/download/download.repo.ts
import { supabaseAdmin } from '../../lib/supabase/admin';
import { DownloadStatus } from '../../types/enums';

export class DownloadRepository {
  // Mengecek validitas license key dan mengambil data relasi produk serta user
  async findLicenseWithProduct(licenseKey: string) {
    const { data, error } = await supabaseAdmin
      .from('licenses')
      .select(`
        id,
        license_key,
        status,
        user_id,
        product_id,
        products (
          id,
          title,
          file_source_url
        )
      `)
      .eq('license_key', licenseKey)
      .single();

    if (error) return null;
    return data;
  }

  // Mencatat log aktivitas download ke database
  async createDownloadLog(logData: {
    user_id: string;
    product_id: string;
    license_id: string;
    status: DownloadStatus;
    ip_address?: string;
  }) {
    const { data, error } = await supabaseAdmin
      .from('download_logs')
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error('Failed to create download log:', error.message);
      return null;
    }
    return data;
  }
}