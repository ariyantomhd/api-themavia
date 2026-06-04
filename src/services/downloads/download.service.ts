import { supabaseAdmin } from '@/lib/supabase/admin';

export class DownloadService {
  /**
   * Generates a secure, short-lived signed URL for digital asset extraction.
   * Enforces strict order purchase validations prior to granting storage token handshakes.
   */
  static async generateSecureDownloadLink(userId: string, productId: string) {
    // 1. Anti-Piracy Guard: Cross-check if the buyer has a cleared 'paid' order invoice for this asset
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .contains('product_ids', [productId]) // Checks if the productId exists within the text-array column
      .single();

    if (orderError || !order) {
      throw new Error('Access denied. No successful purchase log found for this asset.');
    }

    // 2. Fetch the target file path mapping parameters directly from the DB
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('files')
      .eq('id', productId)
      .single();

    if (productError || !product || !product.files || product.files.length === 0) {
      throw new Error('The requested asset file structural map is currently missing.');
    }

    // Grab the primary file payload target path (assuming single archive or main repository package)
    const targetFile = product.files[0];
    
    // Extract relative storage path bucket key layout out from the absolute URL
    // e.g., "products/defi-script-v1.zip"
    const storageFilePath = targetFile.url.split('/sign/').pop() || targetFile.url;

    // 3. Command Supabase Storage core to issue a localized transient token key (Expired in 60 seconds)
    const { data: signedData, error: storageError } = await supabaseAdmin
      .storage
      .from('marketplace-assets') // Your private secure bucket identifier
      .createSignedUrl(storageFilePath, 60); // 60 seconds strict expiry window

    if (storageError || !signedData) {
      throw new Error('Failed to generate secure temporary storage authorization link.');
    }

    // 4. Register audit trail index for internal transaction logs to track heavy leecher spammers
    await supabaseAdmin
      .from('downloads')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          file_id: targetFile.name,
          downloaded_at: new Date().toISOString()
        }
      ]);

    return {
      downloadUrl: signedData.signedUrl,
      expiresIn: '60 seconds',
      fileName: targetFile.name
    };
  }
}