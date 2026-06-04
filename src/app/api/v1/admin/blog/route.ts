import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { checkRole } from '@/middlewares/rbac/checkRole';
import { supabaseAdmin } from '@/lib/supabase/admin';

// [GET] Tarik semua daftar artikel blog untuk manajemen admin
export async function GET(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied. Admin clearance required.');
    }

    const { data: articles, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, status, views, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        return ApiResponseHelper.success([], 'Blog ledger is currently empty.');
      }
      throw error;
    }

    return ApiResponseHelper.success(articles, 'Global blog post registry synchronized.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Blog API failure.');
  }
}

// [POST] Terbitkan artikel tutorial/berita baru ke platform Themavia
export async function POST(req: NextRequest) {
  try {
    const adminUser = await verifyToken(req);
    if (!adminUser || !checkRole(adminUser.role || 'buyer', ['admin'])) {
      return ApiResponseHelper.forbidden('Access denied.');
    }

    const body = await req.json();
    const { title, slug, content, status } = body; // status: 'draft' atau 'published'

    if (!title || !slug) return ApiResponseHelper.badRequest('Missing title or slug identifiers.');

    const { data: newPost, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([{ title, slug, content, status, author_id: adminUser.id }])
      .select()
      .single();

    if (error) throw error;
    return ApiResponseHelper.success(newPost, 'New blog entry successfully indexed.');
  } catch (error: unknown) {
    return ApiResponseHelper.badRequest(error instanceof Error ? error.message : 'Blog publish failed.');
  }
}