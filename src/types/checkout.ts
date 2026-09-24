// src/types/checkout.ts

export interface CheckoutDTO {
  shipping_address?: string;
  notes?: string;
}

export interface OrderItemResponse {
  product_id: string;
  quantity: number;
  price: number;
}

export interface CheckoutResponse {
  message: string;
  order: {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_address?: string;
    notes?: string;
    created_at: string;
  };
  items: OrderItemResponse[];
}