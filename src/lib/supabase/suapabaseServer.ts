import { createClient } from '@supabase/supabase-js';

/**
 * สร้าง Supabase client สำหรับ server-side ที่มีสิทธิ์ admin (service role)
 * ใช้ใน API routes ที่ต้องการ bypass RLS หรือจัดการข้อมูลระดับ admin
 * 
 * @example
 * const supabase = getSupabaseAdmin();
 * const { data } = await supabase.from('users').select('*'); // ไม่มี RLS
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * สร้าง Supabase client สำหรับ server-side ที่ใช้ user token
 * ใช้ใน API routes ที่ต้องการเข้าถึงข้อมูลในบริบทของ user (ผ่าน RLS)
 * 
 * @param token - Bearer token จาก Authorization header
 * @example
 * const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
 * const supabase = getSupabaseWithAuth(token);
 * const { data: { user } } = await supabase.auth.getUser();
 */
export function getSupabaseWithAuth(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  if (!token) {
    throw new Error('Token is required for authenticated Supabase client');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}