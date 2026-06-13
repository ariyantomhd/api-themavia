import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await verifyToken(req);
    
    if (!sessionUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: orders, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('total_price')
      .eq('user_id', sessionUser.id);

    // Kalau mau lebih aman, bisa cek dbError di sini
    if (dbError) throw new Error('Database query failed');

    return NextResponse.json({
      user: { 
        name: sessionUser.name 
      },
      stats: {
        totalInvested: orders?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0,
        assetsOwned: orders?.length || 0,
      }
    });

  } catch (error) {
    // Gunakan 'error' untuk logging agar ESLint tidak protes
    console.error('[DASHBOARD_API_ERROR]:', error);
    return NextResponse.json({ message: 'Gagal memuat dashboard' }, { status: 500 });
  }
}