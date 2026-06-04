// src/services/paymentService.ts (Di Sisi Frontend)

const BASE_URL = "https://api.themavia.com/api/v1";

export const paymentApi = {
  // 1. Fungsi Pembuat Order -> Harus mengarah ke folder 'checkout' di BE Abang
  createPayPalOrder: async (productId: string, licenseType: string) => {
    const response = await fetch(`${BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        product_id: productId, 
        license_type: licenseType 
      }),
    });
    const data = await response.json();
    return data.id; // Mengembalikan PayPal Order ID dari Backend
  },

  // 2. Fungsi Verifikasi -> Bisa mengarah ke folder 'checkout' atau 'orders' di BE Abang
  capturePayPalOrder: async (orderId: string, productId: string, licenseType: string) => {
    const response = await fetch(`${BASE_URL}/checkout/capture`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        order_id: orderId,
        product_id: productId,
        license_type: licenseType
      }),
    });
    return await response.json(); // Mengembalikan { success: true } setelah DB diupdate oleh BE
  }
};