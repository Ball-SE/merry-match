import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed. Use POST method." });
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

    // ใช้ service-role key สำหรับ bypass RLS ถ้ามี
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
    const admin = serviceKey
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
      : supabase;

    const {
      data: { user },
      error: getUserErr,
    } = await supabase.auth.getUser();
    if (getUserErr) return res.status(401).json({ error: getUserErr.message });
    if (!user) return res.status(401).json({ error: "Invalid token" });

    // รับ body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { id } = body as { id?: string }; // id = id ของคนที่โดนปัด
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing swiped user ID" });
    }

    console.log("[unswipe] deleting swipe", { swiper_id: user.id, swiped_id: id });

    // หา swipe record
    const { data: swipeRecord, error: findErr } = await admin
      .from("swipes")
      .select("id")
      .match({ swiper_id: user.id, swiped_id: id })
      .maybeSingle();

    if (findErr) {
      console.error("[unswipe] find swipe error", findErr);
      return res.status(500).json({ success: false, message: findErr.message });
    }

    if (!swipeRecord) {
      console.log("[unswipe] swipe not found");
      return res.status(404).json({ success: false, message: "Swipe not found" });
    }

    // ลบ swipe record
    const { error: delErr, count } = await admin
      .from("swipes")
      .delete({ count: "exact" })
      .eq("id", swipeRecord.id);

    if (delErr) {
      console.error("[unswipe] delete error", delErr);
      return res.status(500).json({ success: false, message: delErr.message });
    }

    console.log("[unswipe] deleted swipe", { count });
    return res.status(200).json({ success: true, message: "Unswiped successfully", count });

  } catch (err) {
    console.error("[unswipe] Server error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
