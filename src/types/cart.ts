export interface ProductInCart {
  id: string;
  title: string;
  slug: string;
  regular_price: number;
  discount_price?: number | null;
  thumbnail_url?: string | null;
  status?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  products?: ProductInCart;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  items?: CartItem[];
}