// src/modules/payments/payment.repo.ts
import { supabaseAdmin } from '../../lib/supabase/admin';
import { TransactionStatus, PaymentGateway } from '../../types/enums';

export class PaymentRepository {
  // Simpan data transaksi baru yang terikat ke order_id
  static async createTransaction(data: {
    user_id: string;
    order_id: string;
    paypal_order_id: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    gateway: PaymentGateway;
  }) {
    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction;
  }

  // Update status transaksi berdasarkan PayPal Order ID
  static async updateTransactionStatusByPayPalId(paypalOrderId: string, status: TransactionStatus) {
    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('paypal_order_id', paypalOrderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }

    return transaction;
  }

  // Ambil data transaksi beserta relasi orders dan order_items
  static async getTransactionByPayPalId(paypalOrderId: string) {
    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        orders (
          id,
          user_id,
          total_amount,
          status,
          order_items (
            product_id,
            quantity,
            price
          )
        )
      `)
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (error) {
      return null;
    }

    return transaction;
  }
}