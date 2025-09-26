import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed. Use GET method." });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr) return res.status(401).json({ error: getUserErr.message });
    if (!user) return res.status(401).json({ error: "Invalid token" });

    // ✅ แก้ filter: เอาเฉพาะ swiper_id = user.id
    const { data, error } = await supabase
      .from("swipes")
      .select(`
        id,
        created_at,
        user1:profiles!swipes_swiper_id_fkey (*),
        user2:profiles!swipes_swiped_id_fkey (*)
      `)
      .eq("swiper_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch users from Supabase",
        error: error.message,
      });
    }

    // ✅ map ให้ return เฉพาะ user2 (คนที่เรา swipe) และกรอง null/undefined ออก
    const swipedUsers = (data?.map((item: any) => item.user2).filter(Boolean)) ?? [];

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: swipedUsers,
      count: swipedUsers.length,
    });
  } catch (error: any) {
    console.error("merry API error:", error);
    return res.status(500).json({ error: error?.message ?? "server error" });
  }
}
