import nodemailer from 'nodemailer';

// Konfigurasi SMTP menggunakan Spacemail
// Pastikan nilai ini ada di file .env Anda:
// SMTP_USER=team@themavia.com
// SMTP_PASS=NazrilGibran@1988
const transporter = nodemailer.createTransport({
  host: 'mail.spacemail.com',
  port: 465,
  secure: true, // true untuk port 465
  auth: {
    user: process.env.SMTP_USER || 'team@themavia.com',
    pass: process.env.SMTP_PASS || 'NazrilGibran@1988',
  },
});

/**
 * Fungsi untuk mengirim email
 * @param to - Alamat email tujuan
 * @param subject - Judul email
 * @param html - Isi email dalam format HTML
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"Themavia Team" <team@themavia.com>',
      to,
      subject,
      html,
    });
    
    console.log("✅ Email berhasil dikirim ke %s, ID: %s", to, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Gagal kirim email ke %s:", to, error);
    // Kita throw agar backend tahu ada masalah jika diperlukan
    throw error;
  }
};