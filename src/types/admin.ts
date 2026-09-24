import { AffiliateStatus, CommissionStatus, PayoutStatus } from './enums';

export interface AffiliateProfile {
  id: string;
  user_id: string;
  status: AffiliateStatus;
  total_earnings: number;
  balance: number;
  created_at: string;
}

export interface AffiliateProductLink {
  id: string;
  affiliate_id: string;
  product_id: string;
  affiliate_token: string;
  clicks_count: number;
  created_at: string;
}


export interface AffiliateProductClickLog {
  id: string;
  affiliate_id: string;
  product_id: string;
  affiliate_token: string;
  ip_address: string;
  user_agent: string | null;
  referrer_url: string | null;
  clicked_at: string;
}

export interface AffiliateCommission {
  id: string;
  order_id: string;
  order_item_id: string;
  affiliate_id: string;
  commission_rate: number;
  commission_amount: number;
  status: CommissionStatus;
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  amount: number;
  status: PayoutStatus;
  paypal_email: string;
  paypal_payout_batch_id?: string;
  admin_notes?: string;
  processed_at?: string;
  created_at: string;
}