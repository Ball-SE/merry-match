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

  // ใช้ service-role (ถ้ามี) สำหรับงานลบแบบมี FK/RLS หลังจากตรวจสอบตัวตนแล้วเท่านั้น
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const admin = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    : supabase;
  if (!serviceKey) {
    console.warn("[unmatch] SUPABASE_SERVICE_ROLE_KEY missing. Falling back to user-scoped client; RLS may block deletes.");
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return res.status(401).json({ success: false, message: "Invalid session" });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { matchId, otherUserId } = body as { matchId?: string; otherUserId?: string };
  if (!matchId && !otherUserId) return res.status(400).json({ success: false, message: "Missing parameters" });

  let error: { message?: string } | null = null;
  let count: number | null = null;

  if (otherUserId) {
    console.log("[unmatch] using otherUserId path", { userId: user.id, otherUserId });
    // หา match_id ก่อนเพื่อลบ messages ที่พึ่งพาอยู่
    const [a, b] = [user.id, otherUserId].sort();
    const { data: foundMatch, error: findErr } = await supabase
      .from("matches")
      .select("id")
      .match({ user1_id: a, user2_id: b })
      .maybeSingle();
    if (findErr) {
      console.error("[unmatch] find match error(otherUserId)", findErr);
      error = findErr as { message?: string };
    } else if (!foundMatch) {
      console.log("[unmatch] match not found(otherUserId)");
      count = 0;
    } else {
      const matchIdToDelete = foundMatch.id as string;
      // ลบ messages ก่อนเพื่อไม่ให้ FK ขวาง
      const delMsgResp = await admin
        .from("messages")
        .delete({ count: "exact" })
        .eq("match_id", matchIdToDelete);
      if (delMsgResp.error) {
        console.error("[unmatch] delete messages error", delMsgResp.error);
        error = delMsgResp.error;
      } else {
        console.log("[unmatch] delete messages count", delMsgResp.count);
        const resp = await admin
          .from("matches")
          .delete({ count: "exact" })
          .eq("id", matchIdToDelete);
        if (resp.error) console.error("[unmatch] delete error(otherUserId)", resp.error);
        console.log("[unmatch] delete count(otherUserId)", resp.count);
        error = resp.error;
        count = resp.count ?? null;
      }
    }
  } else if (matchId) {
    console.log("[unmatch] using matchId path", { userId: user.id, matchId });
    // ลบ messages ก่อนเพื่อไม่ให้ FK ขวาง (ใช้ service-role)
    const delMsgResp = await admin
      .from("messages")
      .delete({ count: "exact" })
      .eq("match_id", matchId);
    if (delMsgResp.error) {
      console.error("[unmatch] delete messages error", delMsgResp.error);
      error = delMsgResp.error;
    } else {
      console.log("[unmatch] delete messages count", delMsgResp.count);
      const resp = await admin
        .from("matches")
        .delete({ count: "exact" })
        .eq("id", matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (resp.error) console.error("[unmatch] delete error(matchId)", resp.error);
      console.log("[unmatch] delete count(matchId)", resp.count);
      error = resp.error;
      count = resp.count ?? null;
    }
  }

  if (error) {
    console.error("[unmatch] final error", error);
    const msg = error.message || "Unknown";
    if (/row-level security/i.test(msg)) {
      return res.status(403).json({ success: false, message: msg });
    }
    if (/invalid input syntax for type uuid/i.test(msg)) {
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: msg });
  }
  if (!count) return res.status(404).json({ success: false, message: "Match not found or not owned by user" });

  return res.status(200).json({ success: true, message: "Unmatched successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
