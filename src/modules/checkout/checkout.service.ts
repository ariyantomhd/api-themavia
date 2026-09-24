// src/modules/checkout/checkout.service.ts
import { CheckoutRepository } from './checkout.repo';
// @ts-ignore
import paypal from '@paypal/checkout-server-sdk';
import { client } from '../../lib/paypal';
import { PaymentRepository } from '../payments/payment.repo';
import { TransactionStatus, PaymentGateway } from '../../types/enums';

export class CheckoutService {
  static async processCheckout(userId: string, shippingAddress?: string, notes?: string, currency: string = 'USD') {
    // 1. Ambil keranjang user
    const cart = await CheckoutRepository.getCartWithItems(userId);
    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      throw new Error('Keranjang belanja Anda kosong.');
    }

    // 2. Hitung total harga & siapkan item order
    let totalAmount = 0;
    const orderItemsData: { product_id: string; quantity: number; price: number }[] = [];

    for (const item of cart.cart_items) {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      if (!product) continue;

      // Type assertion untuk membaca 'price' atau 'regular_price'
      const rawProduct = product as any;
      const price = rawProduct.price ?? rawProduct.regular_price ?? 0;
      totalAmount += price * item.quantity;

      orderItemsData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: price,
      });
    }

    if (totalAmount <= 0) {
      throw new Error('Total pembayaran tidak valid.');
    }

    // 3. Buat order utama di database (Status: PENDING)
    const order = await CheckoutRepository.createOrder(userId, totalAmount, shippingAddress, notes);

    // 4. Masukkan item-item ke order_items
    const finalOrderItems = orderItemsData.map(i => ({
      ...i,
      order_id: order.id,
    }));
    await CheckoutRepository.createOrderItems(finalOrderItems);

    // 5. Buat PayPal Order via PayPal SDK
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.id,
          amount: {
            currency_code: currency,
            value: totalAmount.toFixed(2),
          },
        },
      ],
    });

    const paypalResponse = await client().execute(request);
    const paypalOrderData = paypalResponse.result;
    const approvalLink = paypalOrderData.links.find((link: any) => link.rel === 'approve')?.href;

    // 6. Simpan rekaman transaksi PayPal awal (menggunakan string literal sesuai tipe data)
    await PaymentRepository.createTransaction({
      user_id: userId,
      order_id: order.id,
      paypal_order_id: paypalOrderData.id,
      amount: totalAmount,
      currency,
      status: 'PENDING' as TransactionStatus,
      gateway: 'PAYPAL' as PaymentGateway,
    });

    // 7. Kosongkan keranjang belanja pengguna setelah checkout berhasil diinisialisasi
    await CheckoutRepository.clearCart(cart.id);

    return {
      message: 'Checkout berhasil diinisialisasi. Silakan selesaikan pembayaran.',
      order_id: order.id,
      paypal_order_id: paypalOrderData.id,
      approval_url: approvalLink,
      total_amount: totalAmount,
    };
  }
}