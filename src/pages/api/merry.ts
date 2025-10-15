import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import {
  createMatchNotification,
  createLikeNotification,
} from "@/lib/notification/notificationService";

interface PackageData {
  daily_swipe_limit: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    // 1) รับ Bearer token
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // 2) สร้าง Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // 3) หา user จาก token
    const {
      data: { user },
      error: getUserErr,
    } = await supabase.auth.getUser();
    if (getUserErr) return res.status(401).json({ error: getUserErr.message });
    if (!user) return res.status(401).json({ error: "Invalid token" });

    // 4) รับ body
    const { swiped_id, action } = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as {
      swiped_id?: string;
      action?: "like" | "pass";
    };

    if (!swiped_id || (action !== "like" && action !== "pass"))
      return res.status(400).json({ error: "Missing fields" });
    if (swiped_id === user.id)
      return res.status(400).json({ error: "Cannot swipe yourself" });

    // 🆕 5) Check และ update merry_limit
    const { data: subData, error: subErr } = await supabase
      .from("subscriptions")
      .select(
        `
      id,
      merry_limit,
      updated_at,
      package_id,
      packages (
        daily_swipe_limit
      )
    `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subErr) return res.status(500).json({ error: subErr.message });

    let subscription = subData;

    // 🔥 ถ้าไม่มี subscription ให้สร้าง Free subscription อัตโนมัติ
    if (!subscription) {
      // ตรวจสอบว่ามี Free package ไหม
      const { data: freePackage } = await supabase
        .from("packages")
        .select("id, daily_swipe_limit")
        .eq("price", 0) // เปลี่ยนจาก .eq("name", "Free")
        .maybeSingle();

      if (freePackage) {
        // สร้าง subscription ใหม่
        const { data: newSub, error: createErr } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            package_id: freePackage.id,
            status: "active", // เปลี่ยนจาก 'disabled' เป็น 'active'
            merry_limit: freePackage.daily_swipe_limit || 10,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          })
          .select(
            `
            id,
            merry_limit,
            updated_at,
            package_id,
            packages (
              daily_swipe_limit
            )
          `
          )
          .single();

        if (!createErr && newSub) {
          subscription = newSub; // ใช้ subscription ที่สร้างใหม่
        } else {
          console.error("Create subscription error:", createErr);
          return res.status(403).json({
            error: "Failed to create subscription",
            merry_limit: 0,
            daily_swipe_limit: 10,
          });
        }
      } else {
        // ถ้าไม่มี Free package ในระบบ
        return res.status(403).json({
          error: "No package available",
          merry_limit: 0,
          daily_swipe_limit: 10,
        });
      }
    }

    // ดึงค่า limit ปัจจุบัน
    const currentLimit = subscription.merry_limit;
    const dailyLimit = Array.isArray(subscription.packages)
      ? subscription.packages[0]?.daily_swipe_limit ?? 10
      : (subscription.packages as PackageData)?.daily_swipe_limit ?? 10;

    // Check ว่า limit เหลือไหม
    if (currentLimit <= 0) {
      return res.status(403).json({
        error: "Swipe limit reached",
        merry_limit: 0,
        daily_swipe_limit: dailyLimit,
      });
    }

    // 6) บันทึก swipe
    const { error: upErr } = await supabase
      .from("swipes")
      .upsert(
        { swiper_id: user.id, swiped_id, action },
        { onConflict: "swiper_id,swiped_id", ignoreDuplicates: true }
      );
    if (upErr) return res.status(500).json({ error: upErr.message });

    // 🆕 6.1) ลด merry_limit ลง 1
    const newLimit = currentLimit - 1;
    const { error: updateLimitErr } = await supabase
      .from("subscriptions")
      .update({ merry_limit: newLimit })
      .eq("id", subscription.id);

    if (updateLimitErr)
      console.error("Update limit error:", updateLimitErr.message);

    // 7) ดึงข้อมูล user ที่ถูก swipe
    const { data: swipedUser, error: swipedErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", swiped_id)
      .maybeSingle();
    if (swipedErr)
      console.error("Error fetching swiped user:", swipedErr?.message);

    // 8) เช็ค like สวนกลับ
    let matched = false;
    let matchUser: typeof swipedUser = null;
    if (action === "like") {
      const { data: reciprocal, error: recErr } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", swiped_id)
        .eq("swiped_id", user.id)
        .eq("action", "like")
        .maybeSingle();
      if (recErr) return res.status(500).json({ error: recErr.message });

      if (reciprocal) {
        const [a, b] = [user.id, swiped_id].sort();
        const { error: matchErr } = await supabase
          .from("matches")
          .upsert(
            { user1_id: a, user2_id: b },
            { onConflict: "user1_id,user2_id", ignoreDuplicates: true }
          );
        if (matchErr) console.error("match upsert:", matchErr.message);
        matched = true;
        matchUser = swipedUser;

        const { data: currentUserProfile } = await supabase
          .from("profiles")
          .select("name, photo_url")
          .eq("id", user.id)
          .single();

        const { data: swipeRecord, error: findErr } =   await supabase
          .from("swipes")
          .select("id, swiper_id, swiped_id")
          .or(`and(swiper_id.eq.${user.id},swiped_id.eq.${swiped_id}),and(swiper_id.eq.${swiped_id},swiped_id.eq.${user.id})`);
          
          if (findErr) {
            console.error("[unswipe] find swipe error", findErr);
            return res.status(500).json({ success: false, message: findErr.message });
          }
      
          if (!swipeRecord) {
            console.log("[unswipe] swipe not found");
            return res.status(404).json({ success: false, message: "Swipe not found" });
          }

          const idsToDelete = swipeRecord.map(r => r.id);
          const { error: delErr, count } = await supabase
            .from("swipes")
            .delete({ count: "exact" })
            .in("id", idsToDelete);

          if (delErr) {
            console.error("[unswipe] delete error", delErr);
            return res.status(500).json({ success: false, message: delErr.message });
          }

          console.log("[unswipe] deleted swipe", { count });

        // เพิ่ม: สร้าง notification สำหรับทั้งสองฝ่าย
        await createMatchNotification(user.id, swiped_id, swipedUser);
        await createMatchNotification(swiped_id, user.id, {
          name: currentUserProfile?.name || user.user_metadata?.name || user.email || "",
          photo_url: currentUserProfile?.photo_url || null  // ✅ ใช้จาก profiles
        });
      } else {
        // ✅ ดึงข้อมูล profile ของ current user ก่อน
        const { data: currentUserProfile } = await supabase
          .from("profiles")
          .select("name, photo_url")
          .eq("id", user.id)
          .single();

        // สร้าง noti แบบ like ให้ผู้ถูกกด
        await createLikeNotification(swiped_id, user.id, {
          name:
            currentUserProfile?.name ||
            user.user_metadata?.name ||
            user.email ||
            "",
          photo_url: currentUserProfile?.photo_url || null, // ✅ ใช้จาก profiles
        });
      }
    }

    return res.status(200).json({
      message: matched ? "Liked — it's a match!" : "Swipe saved",
      match: matched,
      swipedUser,
      matchUser,
      merry_limit: newLimit, // 🆕 ส่ง limit ที่เหลือกลับไป
      daily_swipe_limit: dailyLimit,
    });
  } catch (e: unknown) {
    console.error("merry API error:", e);
    const message = e instanceof Error ? e.message : "server error";
    return res.status(500).json({ error: message });
  }
}
