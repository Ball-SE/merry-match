export const runtime = "edge";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabaseClient";

type Body = {
    swiper_id: string;
    swiped_id: string;
    action: "like" | "dislike";
}

export default async function POST(req: Request) {
    try {
        const body: Body = await req.json();
        const { swiper_id, swiped_id, action } = body;

        if (!swiper_id || !swiped_id || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
          }
        if (swiper_id === swiped_id) {
            return NextResponse.json({ error: "Cannot swipe yourself" }, { status: 400 });
          }
        
    // insert swipe (on conflict do nothing so user can't swipe same person twice)
    const { error: insertError } = await supabase
      .from("swipes")
      .upsert(
        { swiper_id: swiper_id, swiped_id: swiped_id, action },
        { onConflict: "swiper_id,swiped_id", ignoreDuplicates: true }
      );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // หากเป็น like — ตรวจว่าฝ่ายตรงข้ามเคย like เราไหม -> ถ้าใช่ สร้าง match
    if (action === "like") {
      const { data: reciprocal, error: recError } = await supabase
        .from("swipes")
        .select("*")
        .eq("swiper_id", swiper_id)
        .eq("swiped_id", swiped_id)
        .eq("action", "like")
        .limit(1)
        .maybeSingle();

      if (recError) return NextResponse.json({ error: recError.message }, { status: 500 });

      if (reciprocal) {
        // สร้าง match (unique index จะป้องกันซ้ำ)
        const [a, b] = [swiper_id, swiped_id].sort();
        const { error: matchError } = await supabase
          .from("matches")
          .upsert(
            { user1_id: a, user2_id: b },
            { onConflict: "user1_id,user2_id", ignoreDuplicates: true }
          )

        if (matchError) {
          // ถ้า error แต่น่าจะไม่สำคัญ — log แล้วต่อ
          console.error("Match create error:", matchError.message);
        } 
        // else {
        //   // สร้าง notification ให้ทั้งสองคน (optional)
        //   await supabase.from("notifications").insert([
        //     { profiles_id: swiperId, type: "match", payload: { with: swipedId } },
        //     { profiles_id: swipedId, type: "match", payload: { with: swiperId } },
        //   ]);
        // }

        return NextResponse.json({ message: "Liked — it's a match!", match: true });
      }
    }

    return NextResponse.json({ message: "Swipe saved", match: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}