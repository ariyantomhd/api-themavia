// src/template/email-login-alert.ts
export function loginAlertEmailTemplate(fullName: string, location: { ip: string; city: string; region: string; country: string; device: string }) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="color: #333;">Security Alert: New Login Detected</h2>
      <p>Hello <strong>${fullName || 'User'}</strong>,</p>
      <p>Your account was just logged in from a new device or location:</p>
      <ul style="line-height: 1.6;">
        <li><strong>IP Address:</strong> ${location.ip}</li>
        <li><strong>Location:</strong> ${location.city}, ${location.region}, ${location.country}</li>
        <li><strong>Device/Browser:</strong> ${location.device}</li>
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p style="color: #d9534f; margin-top: 20px;">If this wasn't you, please secure your account immediately.</p>
    </div>
  `;
}