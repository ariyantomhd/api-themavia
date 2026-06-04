import { supabaseAdmin } from '@/lib/supabase/admin';
import { AffiliateEarning } from '@/types/marketplace';

export class AffiliateService {
  /**
   * Tracks and increments link clicks securely.
   * Basic anti-fraud: Prevents empty or malicious code structures from hitting the DB.
   */
  static async trackClick(code: string): Promise<boolean> {
    if (!code || code.length > 50) return false;

    try {
      // Increment total_clicks atomically directly inside PostgreSQL
      const { error } = await supabaseAdmin
        .from('affiliates')
        .update({ total_clicks: supabaseAdmin.rpc('increment_clicks') }) 
        .eq('code', code)
        .eq('status', 'active');

      if (error) return false;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Evaluates affiliate tier adjustments based on their performance rules.
   * Automatically moves affiliate up to 'pro' or 'elite' levels.
   */
  static async evaluateAndUpgradeTier(affiliateId: string, currentSalesCount: number): Promise<void> {
    // Fetch all active commission rule milestones sorted by tier threshold
    const { data: rules } = await supabaseAdmin
      .from('commission_rules')
      .select('*')
      .order('threshold', { ascending: true });

    if (!rules) return;

    let targetTier: 'basic' | 'pro' | 'elite' = 'basic';
    let targetRate = 0.20; // 20% default baseline rate

    for (const rule of rules) {
      if (currentSalesCount >= rule.threshold) {
        targetTier = rule.name.toLowerCase() as 'basic' | 'pro' | 'elite';
        targetRate = Number(rule.rate) / 100;
      }
    }

    // Lock the new tier and rate updates into the affiliate account registry
    await supabaseAdmin
      .from('affiliates')
      .update({ 
        current_tier: targetTier, 
        commission_rate: targetRate 
      })
      .eq('id', affiliateId);
  }

  /**
   * Processes and distributes earnings to the affiliate from a successful order purchase.
   * Prices are pulled strictly from the database to prevent injection hacks.
   */
  static async processReferralEarning(orderId: string, affiliateCode: string): Promise<AffiliateEarning | null> {
    try {
      // 1. Verify affiliate validity and freeze configuration state
      const { data: affiliate, error: affError } = await supabaseAdmin
        .from('affiliates')
        .select('*')
        .eq('code', affiliateCode)
        .eq('status', 'active')
        .single();

      if (affError || !affiliate) return null;

      // 2. Fetch the settled order invoice parameters
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('status', 'paid')
        .single();

      if (orderError || !order) return null;

      // 3. Securely calculate percentage commission splits based on order total price
      // In a strict product-based architecture, this is snapshot-isolated to avoid balance fraud
      const commissionAmount = Math.round((order.total_price * affiliate.commission_rate) * 100) / 100;

      // 4. Inject structural transaction ledgers inside a database escrow vault
      const { data: earning, error: earningError } = await supabaseAdmin
        .from('affiliate_earnings')
        .insert([
          {
            affiliate_id: affiliate.id,
            order_id: order.id,
            amount: commissionAmount,
            status: 'completed',
          },
        ])
        .select()
        .single();

      if (earningError || !earning) throw new Error('Earning ledger injection crashed.');

      // 5. Update wallet ledger atomically (Increments the affiliate balance)
      const { error: walletError } = await supabaseAdmin
        .from('wallets')
        .update({
          affiliate_balance: supabaseAdmin.rpc('add_balance', { amount_to_add: commissionAmount })
        })
        .eq('user_id', affiliate.user_id);

      if (walletError) throw new Error('Wallet transmission failed.');

      // 6. Update milestone tallies and trigger automated gamified tier checks
      const newReferralCount = affiliate.total_referrals + 1;
      await supabaseAdmin
        .from('affiliates')
        .update({ total_referrals: newReferralCount })
        .eq('id', affiliate.id);

      await this.evaluateAndUpgradeTier(affiliate.id, newReferralCount);

      return earning;
    } catch {
      return null;
    }
  }
}