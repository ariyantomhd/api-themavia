// src/template/email-reset-password.ts
export function resetPasswordEmailTemplate(resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>You requested a password reset for your tmv-hub account.</p>
      <p>Click the button or link below to set a new password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
}