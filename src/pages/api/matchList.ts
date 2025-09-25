import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler (req:NextApiRequest, res:NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: "Method not allowed. Use GET method."
        });
    }
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

        const { data, error} = await supabase
        .from("matches")
        .select(`
            id,
            matched_at,
            user1_id,
            user2:profiles!matches_user2_id_fkey (
            id,
            name,
            age,
            gender,
            location,
            photo_url,
            sexual_preferences,
            racial_preferences,
            meeting_interests,
            interests
        )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("matched_at", { ascending: false })

        if (error) {
            return res.status(400).json({
              success: false,
              message: "Failed to fetch users from Supabase",
              error: error.message
            });
          }

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: data,
            count: data?.length || 0
          });
    } catch (error: any) {   
        console.error("merry API error:", error);
        return res.status(500).json({ error: error?.message ?? "server error" });
    }
}