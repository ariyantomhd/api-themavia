import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Interface eksplisit agar tidak pakai 'any'
interface VerifiedUser {
  id: string;
  email?: string;
  name?: string;
  user_metadata?: { name?: string };
}

interface Order {
  total_price: number | null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function GET(req: NextRequest) {
  if (req.method === 'OPTIONS') return new NextResponse(null, { headers: corsHeaders });

  try {
    // 1. Token Handling
    let token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      const cookie = req.cookies.getAll().find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
      if (cookie) {
        const decoded = JSON.parse(Buffer.from(cookie.value.replace('base64-', ''), 'base64').toString());
        token = decoded.access_token;
        if (token) req.headers.set('authorization', `Bearer ${token}`);
      }
    }

    // 2. Auth & DB
    const sessionUser = await verifyToken(req) as VerifiedUser | null;
    if (!sessionUser) return NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_price')
      .eq('user_id', sessionUser.id);

    // 3. Response
    const orderList = (orders || []) as Order[];
    const userName = sessionUser.user_metadata?.name || sessionUser.name || sessionUser.email || 'User';

    return NextResponse.json({
      user: { name: userName },
      stats: {
        totalInvested: orderList.reduce((acc, cur) => acc + (cur.total_price || 0), 0),
        assetsOwned: orderList.length,
      },
    }, { headers: corsHeaders });

  } catch (err) {
    return NextResponse.json({ message: 'Error' }, { status: 500, headers: corsHeaders });
  }
}