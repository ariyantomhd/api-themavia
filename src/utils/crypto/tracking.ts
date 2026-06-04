import { randomBytes } from 'crypto';

export class TrackingHelper {
  /**
   * Membuat kode unik acak untuk link affiliate
   * Contoh hasil: "themavia-a7f2c9"
   */
  static generateAffiliateCode(prefix = 'themavia'): string {
    const randomHex = randomBytes(3).toString('hex'); // 6 karakter acak
    return `${prefix}-${randomHex}`;
  }

  /**
   * Ekstraksi token atau validasi struktur kode jika diperlukan di masa depan
   */
  static isValidCode(code: string): boolean {
    if (!code) return false;
    // Mengamankan input dari percobaan SQL Injection dasar pada param URL
    const safePattern = /^[a-zA-Z0-9_-]{3,30}$/;
    return safePattern.test(code);
  }
}