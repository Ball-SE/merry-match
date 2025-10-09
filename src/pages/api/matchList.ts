import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type ProfileRow = { id: string } & Record <string, unknown>;

type MatchRow = {
  id: string;
  matched_at: string | null;
  user1_id: string;
  user2_id: string;
  user1: ProfileRow | null;
  user2: ProfileRow | null;
}

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

      const rows = (data ?? []) as unknown as MatchRow[];

    // ดึงข้อความล่าสุดของแต่ละ match
    const matchIds = rows.map(match => match.id);
    const lastMessages: Record<string, { message_text: string | null; created_at: string; message_type?: string; sender_id?: string }> = {};
    
    if (matchIds.length > 0) {
      const { data: messagesData } = await supabase
        .from("messages")
        .select("match_id, message_text, created_at, message_type, sender_id")
        .in("match_id", matchIds)
        .order("created_at", { ascending: false });

      // เก็บข้อความล่าสุดของแต่ละ match
      if (messagesData) {
        messagesData.forEach((msg: { match_id: string; message_text: string | null; created_at: string; message_type?: string; sender_id?: string }) => {
          if (!lastMessages[msg.match_id]) {
            lastMessages[msg.match_id] = {
              message_text: msg.message_text,
              created_at: msg.created_at,
              message_type: msg.message_type,
              sender_id: msg.sender_id
            };
          }
        });
      }
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch users from Supabase",
        error: error.message,
      });
    }

        // ✅ แปลง data ให้ return โปรไฟล์ "อีกฝั่ง" พร้อมแนบ match_id, other_user_id และ last_message
        const transformed = rows
        .map((match: MatchRow) => {
          const isUser1 = match.user1_id === user.id;
          const otherProfile = isUser1 ? match.user2 : match.user1;
          const otherUserId = isUser1 ? match.user2_id : match.user1_id;
          if (!otherProfile) return null;
          const lastMessage = lastMessages[match.id];
          
          // จัดการข้อความที่จะแสดง
          let displayMessage: string | null = null;
          if (lastMessage) {
            if (lastMessage.message_type === 'image') {
              // ถ้าเป็นรูปภาพ
              if (lastMessage.sender_id === user.id) {
                displayMessage = "You sent a photo";
              } else {
                displayMessage = "Sent you a photo";
              }
            } else {
              // ข้อความธรรมดา
              displayMessage = lastMessage.message_text;
            }
          }
          
          const result = { 
            ...otherProfile, 
            match_id: match.id,
            matched_at: match.matched_at, 
            other_user_id: otherUserId,
            last_message: displayMessage,
            last_message_at: lastMessage?.created_at || null
          } as ProfileRow & { 
            match_id: string; 
            other_user_id: string; 
            last_message: string | null;
            last_message_at: string | null;
          };
          return result;
        }).filter((p): p is ProfileRow & { match_id: string; other_user_id: string; last_message: string | null; last_message_at: string | null } => Boolean(p));
    
        // 🔹 ลบ swipe ของคู่ที่ match แล้ว (ถ้ามี)
        const matchedIds = rows
        .map((match: MatchRow) => {
          if (match.user1_id === user.id) return match.user2_id;
          if (match.user2_id === user.id) return match.user1_id;
          return null;
        }).filter((id): id is string => Boolean(id));

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
  } catch (error: unknown) {
    console.error("merry API error:", error);
    const message = error instanceof Error ? error.message : "server error"
    return res.status(500).json({ error: message});
  }
}
