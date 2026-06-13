import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';

// Definisikan tipe data agar tidak pakai 'any'
interface Transaction {
  amount: number;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  status: string;
  transactions: Transaction[];
}

export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role ?? '', ['admin'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mengambil data pelanggan dengan relasi ke transaksi
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, 
        full_name, 
        email, 
        created_at, 
        status,
        transactions (amount)
      `);

    if (error) throw error;

    // Memproses data dengan tipe Profile
    const profiles = (data as Profile[]) || [];
    
    const formattedCustomers = profiles.map((user) => {
      const totalSpent = user.transactions.reduce(
        (sum, t) => sum + (t.amount || 0), 
        0
      );
      
      return {
        id: user.id,
        name: user.full_name || 'Anonymous',
        email: user.email,
        joined: new Date(user.created_at).toLocaleDateString('id-ID'),
        orders: user.transactions.length,
        spent: totalSpent,
        status: user.status || 'Active'
      };
    });

    return NextResponse.json(formattedCustomers);
  } catch (err) {
    console.error("GET Customers Error:", err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}