export * from './enums';
export * from './auth';
export * from './product';
export * from './order';
export * from './security';
export * from './blog';
export * from './dashboard';
export * from './cart';
export * from './license';
export * from './admin';

export interface ApiResponse<T = unknown> {
  success: boolean;
  status_code?: number;
  message?: string;
  data: T;
  error?: {
    code: string;
    details?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total_rows: number;
    total_pages: number;
  };
}