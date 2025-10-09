import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: {
    match_type: string;
    matched_user_id: string;
    matched_user_name: string;
    matched_user_photo: string;
    match_id: string;
    message_preview: string;
    sender_id: string;
    sender_name: string;
    sender_photo: string;
    // ✅ เพิ่ม fields สำหรับ like
    liker_user_id?: string;
    liker_user_name?: string;
    liker_user_photo?: string;
  };
  is_read: boolean;
  created_at: string;
};

type Session = {
  user: {
    id: string;
  };
  access_token: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const markAsRead = useCallback(
    async (notificationIds: string[]) => {
      if (!session?.access_token) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ notification_ids: notificationIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark as read");
        }

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notificationIds.includes(notif.id)
              ? { ...notif, is_read: true }
              : notif
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [session?.access_token]
  );

  useEffect(() => {
    if (session?.access_token) {
      fetchNotifications();
    }
  }, [session?.access_token, fetchNotifications]);
  // Realtime: subscribe ตาราง notifications ของผู้ใช้คนนี้ // EDIT
  useEffect(() => {
    if (!session?.access_token) return; // EDIT
    const supabase = createClient(
      // EDIT
      process.env.NEXT_PUBLIC_SUPABASE_URL!, // EDIT
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // EDIT
      {
        global: {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      }
    ); // EDIT

    // helper อัปเดต state แบบทันที // EDIT
    const upsertLocal = (n: Notification) => {
      // EDIT
      setNotifications((prev) => {
        const idx = prev.findIndex((x) => x.id === n.id);
        if (idx === -1) return [n, ...prev]; // แทรกใหม่บนสุด // EDIT
        const next = [...prev];
        next[idx] = { ...prev[idx], ...n }; // อัปเดต // EDIT
        return next;
      });
      if (!n.is_read) setUnreadCount((c) => c + 1); // เพิ่ม badge ถ้ายังไม่อ่าน // EDIT
    };

    const updateLocalRead = (id: string, is_read: boolean) => {
      // EDIT
      setNotifications((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_read } : p))
      );
      if (is_read) setUnreadCount((c) => Math.max(0, c - 1)); // ลด badge เมื่ออ่าน // EDIT
    };

    const channel = supabase.channel("realtime:notifications"); // EDIT
    channel
      .on(
        // EDIT
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: Notification }) => {
          const row = payload.new as Notification;
          // กรองเฉพาะของ user นี้เท่านั้น // EDIT
          if (row.user_id === session?.user?.id) upsertLocal(row); // ✅ เช็ค user ปัจจุบัน
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload: { new: Notification }) => {
          const row = payload.new as Notification;
          updateLocalRead(row.id, row.is_read);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }; // cleanup // EDIT
  }, [session?.access_token]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch: fetchNotifications,
  };
}
