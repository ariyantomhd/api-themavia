import { DiscountType, OrderStatus, PaymentGateway, LicenseType, LicenseStatus } from './enums';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase: number;
  usage_limit: number;
  used_count: number;
  expiry_date?: string | null;
  is_active: boolean;
  affiliate_code?: string | null;
  created_at: string;
  updated_at?: string;
}

export type CouponInsert = Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'> & {
  id?: string;
  used_count?: number;
};

export type CouponUpdate = Partial<CouponInsert>;

export function normalizeCoupon(raw: Record<string, unknown> | null | undefined): Coupon {
  const data = raw || {};

  const getString = (key: string): string | undefined => {
    const val = data[key];
    return typeof val === 'string' ? val : undefined;
  };

  const getNumber = (key: string): number | undefined => {
    const val = data[key];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && !isNaN(Number(val))) return Number(val);
    return undefined;
  };

  const getBoolean = (key: string): boolean | undefined => {
    const val = data[key];
    if (typeof val === 'boolean') return val;
    return undefined;
  };

  const rawDiscountType = getString('discount_type') || getString('discountType');
  const discountType: DiscountType = rawDiscountType === 'fixed' ? 'fixed' : 'percentage';

  return {
    id: getString('id') || getString('coupon_id') || `cpn_${Date.now()}`,
    code: (getString('code') || getString('coupon_code') || '').toUpperCase().trim(),
    description: getString('description') || getString('desc') || '',
    discount_type: discountType,
    discount_value: getNumber('discount_value') ?? getNumber('discountValue') ?? 0,
    min_purchase: getNumber('min_purchase') ?? getNumber('minPurchase') ?? 0,
    usage_limit: getNumber('usage_limit') ?? getNumber('usageLimit') ?? 0,
    used_count: getNumber('used_count') ?? getNumber('usedCount') ?? 0,
    expiry_date: getString('expiry_date') || getString('expiryDate') || null,
    is_active: getBoolean('is_active') ?? getBoolean('isActive') ?? true,
    affiliate_code: getString('affiliate_code') || getString('affiliateCode') || null,
    created_at: getString('created_at') || getString('createdAt') || new Date().toISOString(),
    updated_at: getString('updated_at') || getString('updatedAt') || new Date().toISOString(),
  };
}

export interface Order {
  id: string;
  buyer_id: string;
  invoice_number: string;
  subtotal: number;
  discount_total: number;
  buyer_fee: number;
  gateway_fee: number;
  grand_total: number;
  payment_gateway: PaymentGateway;
  paypal_transaction_id: string | null;
  payment_status: OrderStatus;
  affiliate_token_used: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  license_type: LicenseType;
  price_at_purchase: number;
  seller_fee_percentage: number;
  seller_fee_amount: number;
  net_seller_earning: number;
  created_at: string;
}

export interface License {
  id: string;
  license_key: string;
  order_item_id: string;
  product_id: string;
  buyer_id: string;
  license_type: LicenseType;
  activated_domains: string[];
  activation_count: number;
  status: LicenseStatus;
  created_at: string;
  updated_at: string;
}