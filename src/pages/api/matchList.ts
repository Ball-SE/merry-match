import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
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

    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        matched_at,
        user1_id,
        user2_id,
        user1:profiles!matches_user1_id_fkey (*),
        user2:profiles!matches_user2_id_fkey (*)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("matched_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch users from Supabase",
        error: error.message,
      });
    }

    // ✅ แปลง data ให้ return เฉพาะ “อีกฝั่ง”
    const transformed = data?.map((match: any) => {
      if (match.user1_id === user.id) return match.user2;
      if (match.user2_id === user.id) return match.user1;
      return null;
    }).filter(Boolean); // ลบ null ออก

    // 🔹 ลบ swipe ของคู่ที่ match แล้ว (ถ้ามี)
    const matchedIds = data?.map((match: any) => {
      if (match.user1_id === user.id) return match.user2_id;
      if (match.user2_id === user.id) return match.user1_id;
      return null;
    }).filter(Boolean);

    if (matchedIds && matchedIds.length > 0) {
      const { error: delErr } = await supabase
        .from("swipes")
        .delete()
        .eq("swiper_id", user.id)
        .in("swiped_id", matchedIds);
      if (delErr) console.error("Failed to delete swipes for matched users:", delErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: transformed,
      count: transformed?.length || 0,
    });
  } catch (error: any) {
    console.error("merry API error:", error);
    return res.status(500).json({ error: error?.message ?? "server error" });
  }
}
