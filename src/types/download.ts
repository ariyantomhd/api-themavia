// src/types/download.ts
import { DownloadStatus } from './enums';

export interface DownloadRequestDTO {
  license_key: string;
}

export interface DownloadResponse {
  download_url: string;
  file_name?: string;
  expires_in?: string;
}

export interface DownloadLogResponse {
  id: string;
  user_id: string;
  product_id: string;
  license_id: string;
  status: DownloadStatus;
  ip_address?: string;
  created_at: string;
}