import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // 1) รับ Bearer token จาก Postman
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // 2) สร้าง Supabase client ที่ผูกกับ token นี้
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // 3) หา user จาก token (สำคัญต่อ RLS)
    const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr) return res.status(401).json({ error: getUserErr.message });
    if (!user) return res.status(401).json({ error: "Invalid token" });

    // 4) รับ body: ไม่รับ swiper_id จาก client เพื่อกันสวมรอย
    const { swiped_id, action } = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
      swiped_id?: string; action?: "like" | "pass";
    };

    if (!swiped_id || !["like", "pass"].includes(action as any))
      return res.status(400).json({ error: "Missing fields" });
    if (swiped_id === user.id)
      return res.status(400).json({ error: "Cannot swipe yourself" });
    
    // 5) บันทึก swipe
    const { error: upErr } = await supabase
      .from("swipes")
      .upsert(
        { swiper_id: user.id, swiped_id, action },
        { onConflict: "swiper_id,swiped_id", ignoreDuplicates: true }
      );
      if (upErr) {
        console.error('💥 Database upsert error:', upErr);
        return res.status(500).json({ error: upErr.message });
      }

    // 6) เช็ค like สวนกลับ (สลับข้างให้ถูก)
    let matched = false;
    if (action === "like") {
      const { data: reciprocal, error: recErr } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", swiped_id) // เขาเคยปัดเราไหม
        .eq("swiped_id", user.id)
        .eq("action", "like")
        .maybeSingle();
        if (recErr) {
          console.error('💥 Reciprocal check error:', recErr);
          return res.status(500).json({ error: recErr.message });
        }

      if (reciprocal) {
        const [a, b] = [user.id, swiped_id].sort();
        const { error: matchErr } = await supabase
          .from("matches")
          .upsert({ user1_id: a, user2_id: b }, { onConflict: "user1_id,user2_id", ignoreDuplicates: true });
          if (matchErr) {
            console.error("💥 Match creation error:", matchErr.message);
          }
        matched = true;
      }
    }

    return res.status(200).json({ message: matched ? "Liked — it's a match!" : "Swipe saved", match: matched });
  } catch (e: any) {
    console.error("merry API error:", e);
    return res.status(500).json({ error: e?.message ?? "server error" });
  }
}
