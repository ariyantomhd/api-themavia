import { NextRequest, NextResponse } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

/**
 * 🔐 Role Definition (SYNC WITH DATABASE)
 */
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function POST(req: NextRequest) {
  const headers = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { email, password, username } = body;

    // 1. ✅ Validation
    if (!email || !password || !username) {
      const response = ApiResponseHelper.badRequest('Missing mandatory payload registry information.');
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const normalizedUsername = username.toLowerCase().trim();
    const fallbackFullName = username;

    // 2. 🔐 Signup Auth
    const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fallbackFullName,
          username: normalizedUsername,
        },
      },
    });

    if (signUpError || !data.user) {
      const response = ApiResponseHelper.badRequest(
        signUpError?.message || 'Failed to initialize account credentials.'
      );
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const userId = data.user.id;

    // 3. 🧠 Role
    const assignedRole: UserRole = USER_ROLES.USER;

    // 4. 🧱 UPSERT PROFILE
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          full_name: fallbackFullName,
          username: normalizedUsername,
          role: assignedRole,
        },
        { onConflict: 'id' }
      );

    // 5. ❌ Error Handling
    if (profileError) {
      console.error('❌ DB ERROR:', profileError);
      if (profileError.message?.includes('duplicate key')) {
        const response = ApiResponseHelper.success(
          { userId, email, role: assignedRole },
          'Account already exists (recovered).',
          200
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        return response;
      }
      await supabaseAdmin.auth.admin.deleteUser(userId);
      const response = ApiResponseHelper.badRequest(`Database error: ${profileError.message}`);
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    // 6. 📧 Kirim Email Sambutan dengan Detailed Logging (Type-Safe)
    try {
      console.log("Mencoba mengirim email ke:", email);
      const emailResult = await sendEmail(
        email,
        "Selamat Datang di Themavia!",
        `<h1>Halo, ${username}!</h1>
         <p>Terima kasih telah bergabung dengan <strong>Themavia Marketplace</strong>.</p>
         <p>Akun Anda telah berhasil dibuat. Silakan login untuk mulai menjelajahi template dan aset digital kami.</p>
         <br>
         <p>Salam hangat,<br>Themavia Team</p>`
      );
      console.log("✅ Email sukses terkirim. Message ID:", emailResult.messageId);
    } catch (emailError: unknown) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      console.error("❌ Gagal kirim email:", errorMessage);
      console.error("❌ Detail Error:", emailError); 
    }

    // 7. ✅ SUCCESS
    const response = ApiResponseHelper.success(
      {
        userId,
        email: data.user.email,
        role: assignedRole,
      },
      'Account registration completed successfully.',
      201
    );
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;

  } catch (error: unknown) {
    console.error('❌ REGISTER ERROR:', error);
    const message = error instanceof Error ? error.message : 'Registration process failure.';
    const response = ApiResponseHelper.badRequest(message);
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
}

export async function OPTIONS(req: NextRequest) {
  const headers = getCorsHeaders(req);
  return new NextResponse(null, { status: 204, headers });
}