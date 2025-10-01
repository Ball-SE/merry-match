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
  if (!matchId && !otherUserId) return res.status(400).json({ success: false, message: "Missing parameters" });

  let error: { message?: string } | null = null;
  let count: number | null = null;

  if (otherUserId) {
    // ลบด้วยคู่ user1_id,user2_id เพื่อกันปัญหา match_id เปลี่ยนไปหลัง rematch
    const [a, b] = [user.id, otherUserId].sort();
    const resp = await supabase
      .from("matches")
      .delete({ count: "exact" })
      .match({ user1_id: a, user2_id: b });
    error = resp.error;
    count = resp.count ?? null;
  } else if (matchId) {
    const resp = await supabase
      .from("matches")
      .delete({ count: "exact" })
      .eq("id", matchId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
    error = resp.error;
    count = resp.count ?? null;
  }

  if (error) return res.status(500).json({ success: false, message: error.message });
  if (!count) return res.status(404).json({ success: false, message: "Match not found or not owned by user" });

  return res.status(200).json({ success: true, message: "Unmatched successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
