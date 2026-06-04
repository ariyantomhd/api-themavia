import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AffiliateService } from '@/services/affiliate/affiliate.service';
import { GatewayWebhookPayload } from '@/types/marketplace';
import crypto from 'crypto';

interface LocalOrderRow {
  status: string;
  affiliate_code: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-gateway-signature');

    // 1. Anti-Spoofing: Signature Validation Protection Layer
    if (!signature) {
      return ApiResponseHelper.unauthorized('Missing secure transaction gateway signature.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return ApiResponseHelper.forbidden('Tampered or falsified webhook payload signature detected.');
    }

    const payload = JSON.parse(rawBody) as GatewayWebhookPayload;
    const { orderId, transactionStatus, providerReferenceId } = payload;

    if (!orderId || !transactionStatus) {
      return ApiResponseHelper.badRequest('Incomplete tracking parameters.');
    }

    // 2. Filter Explicitly Settled Trades Only
    if (transactionStatus === 'COMPLETED' || transactionStatus === 'settlement') {
      
      const { data: currentOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('status, affiliate_code')
        .eq('id', orderId)
        .single();

      if (fetchError || !currentOrder) {
        return ApiResponseHelper.notFound('Target order tracking record does not exist.');
      }

      const orderRow = currentOrder as LocalOrderRow;

      // Idempotency defense blocks repeat execution routines
      if (orderRow.status !== 'pending') {
        return ApiResponseHelper.success({ processed: false }, 'Order already managed or completed.');
      }

      // 3. Atomically Advance Order State Registry to Paid
      const { error: orderUpdateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: providerReferenceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderUpdateError) throw new Error('Order transition to paid state collapsed.');

      // 4. 💸 Trigger Affiliate Core Automation Service if a referral track code is flagged
      if (orderRow.affiliate_code) {
        await AffiliateService.processReferralEarning(orderId, orderRow.affiliate_code);
      }

      return ApiResponseHelper.success({ orderId, status: 'paid' }, 'Webhook payload digested and financial ledger distributed.');
    }

    return ApiResponseHelper.success({ orderId, status: 'ignored' }, 'Non-actionable transaction status.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal webhook infrastructure failure.';
    return ApiResponseHelper.badRequest(message);
  }
}