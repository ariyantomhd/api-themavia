import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// [GET] Melihat seluruh antrean permohonan pencairan dana komisi dari para affiliator
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied. Admin role required.');
    }

    // Tarik semua data WD, gabungkan dengan email dan nama asli affiliator dari tabel profiles
    const { data: wdRequests, error } = await supabaseAdmin
      .from('withdrawals')
      .select(`
        id,
        amount,
        status,
        bank_name,
        account_number,
        account_name,
        created_at,
        profiles!user_id (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ApiResponseHelper.success(wdRequests, 'Affiliator withdrawal requests synchronized.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'WD Fetch failure.');
  }
}

// [PATCH] Tombol Eksekusi: Approve atau Reject pencairan dana komisi affiliator
export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied.');
    }

    const body = await req.json();
    const { withdrawal_id, status } = body; // status: 'success' atau 'rejected'

    if (!withdrawal_id || !['success', 'rejected'].includes(status)) {
      return ApiResponseHelper.badRequest('Missing validation parameters.');
    }

    // 1. Ambil data record withdrawal asli untuk tahu siapa usernya dan berapa nominalnya
    const { data: currentWD, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('user_id, amount, status')
      .eq('id', withdrawal_id)
      .single();

    if (fetchError || !currentWD) return ApiResponseHelper.badRequest('Withdrawal record not found.');
    if (currentWD.status !== 'pending') return ApiResponseHelper.badRequest('Transaction has already been processed.');

    // 2. Jika Abang memilih REJECTED, kita kembalikan saldonya ke dompet affiliate user tersebut
    if (status === 'rejected') {
      // Ambil saldo berjalan milik affiliate
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('affiliate_balance')
        .eq('id', currentWD.user_id)
        .single();

      const currentBalance = profile?.affiliate_balance || 0;

      // Kembalikan dana yang gagal di-WD ke balance user
      await supabaseAdmin
        .from('profiles')
        .update({ affiliate_balance: currentBalance + currentWD.amount })
        .eq('id', currentWD.user_id);
    }

    // 3. Update status final transaksi withdrawal di ledger
    const { data: updatedWD, error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', withdrawal_id)
      .select()
      .single();

    if (updateError) throw updateError;
    return ApiResponseHelper.success(updatedWD, `Affiliator payout request marked as ${status}.`);
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'WD processing crash.');
  }
}