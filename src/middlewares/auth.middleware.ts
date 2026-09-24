// src/middlewares/auth.middleware.ts
import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase/admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
  userId?: string;
}

export const verifyAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token missing or malformed' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token menggunakan Supabase Admin
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token', 
        error: error?.message 
      });
    }

    // Lampirkan data user ke request
    req.user = user;
    req.userId = user.id; // Mempermudah akses ID user di controller

    next();
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication', 
      error: error.message 
    });
  }
};