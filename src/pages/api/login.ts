import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  success: boolean
  message: string
  user?: User | null
  session?: Session | null
  access_token?: string
  refresh_token?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const { email, password }: LoginRequest = req.body

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username/Email and password are required'
    })
  }

  try {
    let loginEmail = email;
    
    // ตรวจสอบว่า input เป็น email หรือ username
    if (!email.includes('@')) {
      // ถ้าไม่ใช่ email ให้ค้นหา email จาก username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email)
        .single();
        
      if (profileError || !profileData) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username/email or password'
        })
      }
      
      loginEmail = profileData.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}