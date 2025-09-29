import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // รองรับเฉพาะ GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use GET method."
    });
  }

  try {
    // GET ข้อมูล packages ทั้งหมดจาก Supabase
    const { data, error } = await supabase
      .from('packages')
      .select('*')

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch packages from Supabase",
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: "Packages fetched successfully",
      data: data,
      count: data?.length || 0
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}