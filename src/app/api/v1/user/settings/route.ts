import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Mendefinisikan tipe data yang diharapkan dari request body
interface ProfileUpdateInput {
  name?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

export async function PATCH(req: NextRequest) {
  const sessionUser = await verifyToken(req);
  if (!sessionUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ProfileUpdateInput = await req.json();

    // Mapping data ke struktur database
    // Menggunakan partial agar kita bisa selektif mengirim data
    const updateData: { [key: string]: string } = {};

    if (body.full_name || body.name) {
      updateData.full_name = (body.full_name || body.name) as string;
    }
    if (body.username) updateData.username = body.username;
    if (body.avatar_url) updateData.avatar_url = body.avatar_url;
    // Jika kolom 'bio' tidak ada di database, hapus baris di bawah:
    if (body.bio) updateData.bio = body.bio; 

    // Eksekusi update
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', sessionUser.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated', data });
  } catch (error: unknown) {
    // Menangani error tanpa menggunakan variable yang tidak terpakai
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' }, 
      { status: 500 }
    );
  }
}