// src/modules/auth/auth.repo.ts
import { supabaseAdmin } from '../../lib/supabase/admin';
import { UserRole, AuthStatus } from '../../types/enums';

export class AuthRepository {
  static async createUser(data: { id: string; email: string; fullName: string; role?: UserRole; status?: AuthStatus }) {
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: data.id,
          email: data.email,
          full_name: data.fullName,
          role: data.role || UserRole.USER,
          status: data.status || AuthStatus.PENDING,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newUser;
  }

  static async findUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data;
  }

  static async findUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async verifyUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status: AuthStatus.ACTIVE, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}