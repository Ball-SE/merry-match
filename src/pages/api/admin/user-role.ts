import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type Body =
  | { action: "promote"; user_id: string }
  | { action: "demote"; user_id: string };

const requiredEnv = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    for (const k of requiredEnv) {
      if (!process.env[k]) return res.status(500).json({ error: `Missing env: ${k}` });
    }

    // 0) ป้องกัน endpoint ด้วย secret ง่าย ๆ (หรือจะตรวจ session แอดมินจริง ๆ ก็ได้)
    const secret = req.headers["x-admin-secret"];
    if (!secret || secret !== process.env.ADMIN_PANEL_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1) parse body
    const body: Body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as Body);
    if (!body?.user_id || (body.action !== "promote" && body.action !== "demote")) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // 2) ใช้ service role ในการแก้ app_metadata
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const is_admin = body.action === "promote";
    const { data, error } = await admin.auth.admin.updateUserById(body.user_id, {
      app_metadata: { is_admin },
    });
    if (error) return res.status(500).json({ error: error.message });

    // 3) ส่งผลลัพธ์กลับ
    return res.status(200).json({
      ok: true,
      action: body.action,
      user_id: body.user_id,
      app_metadata: data.user?.app_metadata ?? { is_admin },
      note: "User must sign in again to refresh JWT.",
    });
  } catch (e: any) {
    console.error("user-role api error:", e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
