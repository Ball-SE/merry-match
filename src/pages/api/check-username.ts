import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabaseClient";

// เพิ่ม rate limiting
const rateLimitMap = new Map<string, number[]>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username } = req.body;

    // อ่าน IP ให้ปลอดภัย
    const xff = req.headers["x-forwarded-for"];
    const clientIP =
      (Array.isArray(xff)
        ? xff[0]
        : typeof xff === "string"
        ? xff.split(",")[0]?.trim()
        : undefined) || req.socket.remoteAddress || "unknown";

    // Rate limiting: 6 requests / minute / IP
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 24;

    if (!rateLimitMap.has(clientIP)) rateLimitMap.set(clientIP, []);
    const requests = rateLimitMap.get(clientIP)!;
    const validRequests = requests.filter((t) => now - t < windowMs);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    validRequests.push(now);
    rateLimitMap.set(clientIP, validRequests);

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required", isAvailable: false });
    }

    // ตรวจ username ในตาราง profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message, isAvailable: false });
    }

    const exists = !!data;

    return res.status(200).json({
      isAvailable: !exists,
      message: exists ? "Username already exists" : "Username is available",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "System error";
    return res.status(500).json({ error: msg, isAvailable: false });
  }
}