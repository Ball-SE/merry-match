import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";

// เพิ่ม rate limiting
const rateLimitMap = new Map();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // อนุญาตเฉพาะ POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    const clientIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Rate limiting: 6 requests per minute per IP
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 6;

    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, []);
    }

    const requests = rateLimitMap.get(clientIP);
    const validRequests = requests.filter(
      (time: number) => now - time < windowMs
    );

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    validRequests.push(now);
    rateLimitMap.set(clientIP, validRequests);

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        isAvailable: false,
      });
    }

    // ตรวจสอบ email ในตาราง profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    // ตรวจสอบ email ในตาราง auth.users (Supabase Auth)
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers();

    let emailExists = false;

    // ตรวจสอบใน profiles table
    if (profileData && !profileError) {
      emailExists = true;
    }

    // ตรวจสอบใน auth.users table
    if (!emailExists && authData && authData.users) {
      emailExists = authData.users.some(
        (user: any) => user.email === email && user.email_confirmed_at !== null
      );
    }

    return res.status(200).json({
      isAvailable: !emailExists,
      message: emailExists ? "Email already exists" : "Email is available",
    });
  } catch (error: any) {
    console.error("Email check error:", error);
    return res.status(500).json({
      error: error.message || "System error",
      isAvailable: false,
    });
  }
}
