// src/modules/payments/payment.service.ts
// @ts-ignore
import paypal from '@paypal/checkout-server-sdk';
import { client } from '../../lib/paypal';
import { PaymentRepository } from './payment.repo';
import { LicenseService } from '../licenses/license.service';
import { TransactionStatus, PaymentGateway } from '../../types/enums';
import { supabaseAdmin } from '../../lib/supabase/admin';

export class PaymentService {
  // 1. Membuat Order PayPal & Relasi Cart/Orders
  static async createPayPalOrder(userId: string, items: { product_id: string; quantity: number; price: number }[], currency: string = 'USD') {
    // Hitung total keseluruhan harga item
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // A. Buat record di tabel `orders`
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: userId,
        total_amount: totalAmount,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // B. Masukkan item-item ke tabel `order_items`
    const orderItemsData = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // C. Buat Order ke PayPal API
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: totalAmount.toFixed(2),
          },
        },
      ],
    });

    const response = await client().execute(request);
    const orderData = response.result;
    const approvalLink = orderData.links.find((link: any) => link.rel === 'approve')?.href;

    // D. Simpan transaksi ke database terikat ke order_id
    await PaymentRepository.createTransaction({
      user_id: userId,
      order_id: order.id,
      paypal_order_id: orderData.id,
      amount: totalAmount,
      currency,
      status: TransactionStatus.PENDING,
      gateway: PaymentGateway.PAYPAL,
    });

    return {
      paypal_order_id: orderData.id,
      order_id: order.id,
      status: orderData.status,
      approval_url: approvalLink,
    };
  }

  // 2. Capture / Konfirmasi Pembayaran (Dilengkapi Proteksi Double-Trigger & Auto-License Generation)
  static async capturePayPalOrder(paypalOrderId: string) {
    const existingTransaction = await PaymentRepository.getTransactionByPayPalId(paypalOrderId);
    if (!existingTransaction) {
      throw new Error('Transaction not found in database');
    }

    // Proteksi Double-Trigger / Idempotency
    if (existingTransaction.status === TransactionStatus.PAID) {
      return { status: 'COMPLETED', message: 'Transaction was already captured and paid.' };
    }

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const response = await client().execute(request);
    const captureData = response.result;

    if (captureData.status === 'COMPLETED') {
      // A. Update status transaksi jadi PAID
      await PaymentRepository.updateTransactionStatusByPayPalId(paypalOrderId, TransactionStatus.PAID);

      // B. Update status order utama jadi COMPLETED
      await supabaseAdmin
        .from('orders')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', existingTransaction.order_id);

      // C. Generate lisensi otomatis untuk seluruh item di order tersebut
      const orderInfo = existingTransaction.orders;
      if (orderInfo && orderInfo.order_items) {
        await LicenseService.generateLicensesForOrder(
          orderInfo.user_id,
          orderInfo.id,
          orderInfo.order_items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        );
      }
    }

    return captureData;
  }

  // 3. Handle Webhook Event dari PayPal (Dilengkapi Validasi & Anti Double-Trigger)
  static async handleWebhookEvent(event: any) {
    if (!event || !event.event_type || !event.resource) {
      console.warn('[Webhook Warning] Received invalid or empty webhook event payload.');
      return { received: false, message: 'Invalid payload structure' };
    }

    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Webhook Received]: ${eventType}`);

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.COMPLETED') {
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.id;

      if (!paypalOrderId) {
        console.warn('[Webhook Warning] Could not extract PayPal Order ID from resource.');
        return { received: true };
      }

      const transaction = await PaymentRepository.getTransactionByPayPalId(paypalOrderId);

      if (!transaction) {
        console.warn(`[Webhook Warning] Transaction with PayPal ID ${paypalOrderId} not found in database.`);
        return { received: true };
      }

      // Cegah eksekusi ganda jika sudah terlanjur PAID
      if (transaction.status === TransactionStatus.PAID) {
        console.log(`[Webhook Info] Transaction ${paypalOrderId} is already marked as PAID. Skipping.`);
        return { received: true };
      }

      // A. Update status transaksi & order
      await PaymentRepository.updateTransactionStatusByPayPalId(paypalOrderId, TransactionStatus.PAID);
      await supabaseAdmin
        .from('orders')
        .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
        .eq('id', transaction.order_id);

      // B. Generate lisensi masal untuk semua item dalam order
      const orderInfo = transaction.orders;
      if (orderInfo && orderInfo.order_items) {
        await LicenseService.generateLicensesForOrder(
          orderInfo.user_id,
          orderInfo.id,
          orderInfo.order_items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        );
      }

      console.log(`[Webhook Success] Transaction ${paypalOrderId} marked as PAID & licenses generated.`);
    }

    return { received: true };
  }
}