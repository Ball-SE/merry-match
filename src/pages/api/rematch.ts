import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return res.status(401).json({ success: false, message: "Invalid session" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { matchId, otherUserId } = body as { matchId?: string; otherUserId?: string };
    if (!matchId || !otherUserId) return res.status(400).json({ success: false, message: "Missing parameters" });

    // ใช้คู่ id แบบเรียงเพื่อหลีกเลี่ยง duplicate และยึดตามตรรกะใน merry.ts
    const [a, b] = [user.id, otherUserId].sort();

    const { error } = await supabase
      .from("matches")
      .upsert(
        { user1_id: a, user2_id: b, matched_at: new Date().toISOString() },
        { onConflict: "user1_id,user2_id", ignoreDuplicates: true }
      );

    if (error) return res.status(500).json({ success: false, message: "Failed to rematch", error: error.message });

    return res.status(200).json({ success: true, message: "Rematched successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
