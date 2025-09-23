import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";

type Data = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // อนุญาตเฉพาะ GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use GET method."
    });
  }

  try {
    // ตรวจสอบ authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
    }

    // ดึงข้อมูล profile จาก database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
        error: profileError.message
      });
    }

    // ส่งข้อมูลกลับ
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}