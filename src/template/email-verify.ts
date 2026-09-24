// src/template/email-verify.ts
export const verifyEmailTemplate = (verificationLink: string, fullName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Verifikasi Akun Anda</h2>
      <p>Halo <strong>${fullName}</strong>,</p>
      <p>Terima kasih telah mendaftar di <strong>tmv-hub</strong>! Untuk melanjutkan, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verifikasi Email</a>
      </div>
      
      <p>Atau salin tautan berikut ke browser Anda:</p>
      <p style="word-break: break-all; color: #555; font-size: 12px;">${verificationLink}</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">Jika Anda tidak merasa mendaftar, abaikan saja email ini.</p>
    </div>
  `;
};