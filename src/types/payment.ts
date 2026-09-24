// src/types/payment.ts
import { TransactionStatus, PaymentGateway, LicenseType } from './enums';

export interface CreatePayPalOrderDTO {
  product_id: string;
  license_type: LicenseType;
}

export interface PayPalOrderResponse {
  order_id: string;
  approval_url: string;
  status: string;
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  order_id: string;
  paypal_transaction_id?: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_at: string;
}

export interface CapturePayPalOrderDTO {
  order_id: string;
}