// src/modules/auth/auth.service.ts
import { supabaseAdmin } from '../../lib/supabase/admin';
import { transporter } from '../../lib/nodemailer';
import { verifyEmailTemplate } from '../../template/email-verify';
import { loginAlertEmailTemplate } from '../../template/email-login-alert';
import { resetPasswordEmailTemplate } from '../../template/email-reset-password';
import { RegisterDTO } from '../../types/auth';
import { AuthRepository } from './auth.repo';
import { getClientLocation } from '../../lib/ip-helper';
import { Request } from 'express';

export class AuthService {
  static async register(dto: RegisterDTO) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: false,
      user_metadata: { full_name: dto.fullName },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Failed to create user account.');

    const userId = authData.user.id;

    await AuthRepository.createUser({
      id: userId,
      email: dto.email,
      fullName: dto.fullName,
    });

    const verificationLink = `${process.env.APP_URL || 'http://localhost:5000'}/api/auth/verify?token=${userId}`;

    await transporter.sendMail({
      from: `"TMV Hub" <${process.env.SMTP_USER}>`,
      to: dto.email,
      subject: 'Verify Your tmv-hub Account',
      html: verifyEmailTemplate(verificationLink, dto.fullName),
    });

    return {
      message: 'Registration successful! Please check your email to verify your account.',
      userId,
    };
  }

  static async verifyEmail(userId: string) {
    if (!userId) throw new Error('Invalid verification token.');

    // 1. Update status di tabel database kustom 'users' menjadi ACTIVE[cite: 6]
    const updatedUser = await AuthRepository.verifyUser(userId);
    if (!updatedUser) throw new Error('User not found.');

    // 2. Sinkronkan dan aktifkan juga status konfirmasi di sistem pusat Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Failed to update Supabase auth status: ${authError.message}`);
    }

    return {
      message: 'Email successfully verified! Your account is now active.',
    };
  }

  static async login(email: string, pass: string, req: Request) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error || !data.session) throw new Error('Invalid email or password.');

    const userProfile = await AuthRepository.findUserByEmail(email);
    if (userProfile && userProfile.status !== 'ACTIVE') {
      throw new Error('Account is not active. Please check your email for verification.');
    }

    const location = await getClientLocation(req);

    await transporter.sendMail({
      from: `"TMV Hub Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'New Login Alert to tmv-hub',
      html: loginAlertEmailTemplate(userProfile?.full_name, location),
    });

    return {
      message: 'Login successful',
      session: data.session,
      user: userProfile,
    };
  }

  static async getMe(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) throw new Error('User not found.');
    return user;
  }

  static async logout(accessToken: string) {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
    if (error) throw new Error(error.message);
    return { message: 'Successfully logged out.' };
  }

  static async resetPassword(email: string) {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) throw new Error(error.message);

    const resetLink = data.properties?.action_link;

    await transporter.sendMail({
      from: `"TMV Hub Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password - tmv-hub',
      html: resetPasswordEmailTemplate(resetLink || ''),
    });

    return { message: 'Password reset link has been sent to your email.' };
  }

  static async updatePassword(accessToken: string, newPassword: string) {
    if (!accessToken || !newPassword) {
      throw new Error('Access token and new password are required.');
    }

    const { error: sessionError } = await supabaseAdmin.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });

    if (sessionError) throw new Error('Invalid or expired reset token.');

    const { error: updateError } = await supabaseAdmin.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw new Error(updateError.message);

    return { message: 'Password has been successfully updated.' };
  }
}