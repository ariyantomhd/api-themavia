export interface LicenseItem {
  id: string;
  user_id: string;
  product_id: string;
  license_key: string;
  status: string;
  expires_at?: string | null;
  created_at?: string;
  products?: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url?: string | null;
  };
}

export interface LicenseVerifyResponse {
  valid: boolean;
  message: string;
  license?: LicenseItem;
}

export interface DownloadResponse {
  download_url: string;
  expires_in?: string;
  message?: string;
}