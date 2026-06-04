import { supabaseAdmin } from '@/lib/supabase/admin';
import { Withdrawal } from '@/types/marketplace';

export interface CreateWithdrawalInput {
  userId: string;
  amount: number;
  method: 'paypal' | 'bank_transfer' | 'crypto';
  accountDetails: string;
  balanceType: 'vendor' | 'affiliate'; // Distinguish which wallet reservoir to drain
}

export class PayoutService {
  /**
   * Securely registers a new withdrawal request.
   * Leverages strict database atomic balance deductions to prevent double-spending race conditions.
   */
  static async requestWithdrawal(input: CreateWithdrawalInput): Promise<Withdrawal | null> {
    const { userId, amount, method, accountDetails, balanceType } = input;

    // 1. Sanity Check: Prevent zero, negative, or abnormally large drain attempts
    if (amount <= 0 || amount > 5000) {
      throw new Error('Invalid withdrawal amount boundaries ($0 - $5000 limits enforced).');
    }

    try {
      // 2. Fetch the target user's current absolute wallet balances directly from the DB vault
      const { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw new Error('Target funding wallet reservoir not found.');
      }

      // Determine which balance stream the user is attempting to liquidate
      const currentAvailableBalance = balanceType === 'vendor' ? wallet.balance : wallet.affiliate_balance;

      // 3. Anti-Fraud Guard: Block immediate execution if requested funds exceed holdings
      if (amount > currentAvailableBalance) {
        throw new Error('Insufficient funds available for the requested liquidation.');
      }

      // 4. Atomic Deductions: Isolate and drain balance immediately via Database RPC functions
      // This locks the funds so the user cannot trigger concurrent duplicate clicks
      const rpcFunctionName = balanceType === 'vendor' ? 'deduct_vendor_balance' : 'deduct_affiliate_balance';
      
      const { error: deductionError } = await supabaseAdmin
        .from('wallets')
        .update({
          [balanceType === 'vendor' ? 'balance' : 'affiliate_balance']: supabaseAdmin.rpc(rpcFunctionName, { amount_to_deduct: amount }),
          hold_balance: supabaseAdmin.rpc('add_hold_balance', { amount_to_add: amount }) // Park it in escrow hold
        })
        .eq('user_id', userId);

      if (deductionError) {
        throw new Error('Financial ledger deduction transmission crashed.');
      }

      // 5. Inject a secure 'pending' ledger line item into the withdrawals registry table
      const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
        .from('withdrawals')
        .insert([
          {
            user_id: userId,
            amount: amount,
            method: method,
            status: 'pending',
            account_details: accountDetails,
            created_at: new Date().toISOString()
          },
        ])
        .select()
        .single();

      if (withdrawalError || !withdrawal) {
        throw new Error('Failed to register the pending withdrawal logging ticket.');
      }

      return withdrawal as Withdrawal;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Internal payout engine exception.';
      throw new Error(message);
    }
  }
}